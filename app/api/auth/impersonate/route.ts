import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRefresh } from '@/lib/repo/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Find and validate the impersonation token
    const impersonationToken = await prisma.impersonationToken.findUnique({
      where: { token },
      include: {
        admin: true,
        impersonated: true
      }
    })

    if (!impersonationToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    // Check if token is expired
    if (impersonationToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }

    // Check if token was already used
    if (impersonationToken.usedAt) {
      return NextResponse.json({ error: 'Token already used' }, { status: 401 })
    }

    // Mark token as used
    await prisma.impersonationToken.update({
      where: { id: impersonationToken.id },
      data: { usedAt: new Date() }
    })

    // Create a session for the impersonated user
    const deviceSession = await prisma.deviceSession.create({
      data: {
        userId: impersonationToken.impersonatedId,
        deviceName: `Impersonation by ${impersonationToken.admin.name || impersonationToken.admin.email}`,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        ua: request.headers.get('user-agent') || 'unknown',
        lastUsedAt: new Date()
      }
    })

    // Create refresh token for the impersonated user
    const { plain } = await createRefresh(
      impersonationToken.impersonatedId,
      deviceSession.id,
      14400 // 4 hours
    )

    // Create response
    const response = NextResponse.json({
      success: true,
      adminId: impersonationToken.adminId,
      user: {
        id: impersonationToken.impersonated.id,
        name: impersonationToken.impersonated.name,
        email: impersonationToken.impersonated.email
      }
    })
    
    // Set the impersonation cookie without touching the main fitq_refresh cookie
    response.cookies.set('fitq_impersonate', plain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14400, // 4 hours
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Impersonation validation error:', error)
    return NextResponse.json({ error: 'Failed to validate impersonation' }, { status: 500 })
  }
}