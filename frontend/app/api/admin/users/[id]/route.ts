import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateRefreshToken } from '@/lib/repo/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenData = await validateRefreshToken(refreshCookie.value)
    
    if (!tokenData || !tokenData.user || !tokenData.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)
    const body = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }
    
    const updateData: any = {}
    
    if (body.isAdmin !== undefined) {
      updateData.isAdmin = body.isAdmin
    }
    
    if (body.trainerUnlocked !== undefined) {
      updateData.trainerUnlocked = body.trainerUnlocked
    }
    
    // Handle restore functionality
    if (body.restore === true) {
      updateData.deletedAt = null
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })
    
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenData = await validateRefreshToken(refreshCookie.value)
    
    if (!tokenData || !tokenData.user || !tokenData.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check if user exists and is not already deleted
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true, isAdmin: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.deletedAt) {
      return NextResponse.json({ error: 'User already deleted' }, { status: 400 })
    }

    // Don't allow deleting other admins
    if (user.isAdmin) {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
    }

    // Soft delete the user
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}