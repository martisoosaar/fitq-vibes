import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateRefreshToken } from '@/lib/repo/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Get admin user from refresh token
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenData = await validateRefreshToken(refreshCookie.value)
    
    if (!tokenData || !tokenData.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const adminUser = tokenData.user
    
    // Check if user is admin
    if (!adminUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Get the user to impersonate
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't allow impersonating other admins
    if (targetUser.isAdmin) {
      return NextResponse.json({ error: 'Cannot impersonate other admins' }, { status: 403 })
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Create impersonation token (expires in 4 hours)
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000)
    
    await prisma.impersonationToken.create({
      data: {
        token,
        adminId: adminUser.id,
        impersonatedId: userId,
        expiresAt
      }
    })

    // Return the impersonation URL
    const impersonateUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/auth/impersonate?token=${token}`
    
    return NextResponse.json({
      success: true,
      url: impersonateUrl,
      expiresAt,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email
      }
    })
  } catch (error) {
    console.error('Impersonation error:', error)
    return NextResponse.json({ error: 'Failed to create impersonation session' }, { status: 500 })
  }
}