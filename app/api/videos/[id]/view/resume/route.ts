import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateRefreshToken } from '@/lib/repo/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { viewId } = body
    
    if (!viewId) {
      return NextResponse.json({ error: 'View ID required' }, { status: 400 })
    }
    
    console.log('Resume view endpoint called for video:', id, 'viewId:', viewId)
    
    // Get user from cookies
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh') || cookieStore.get('fitq_impersonate')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenData = await validateRefreshToken(refreshCookie.value)
    if (!tokenData || !tokenData.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const userId = tokenData.user.id
    const videoId = parseInt(id)
    
    if (isNaN(videoId)) {
      return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 })
    }

    // Find and reopen the session
    const existingView = await prisma.videoView.findFirst({
      where: {
        id: viewId,
        videoId,
        userId
      }
    })

    if (!existingView) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Reopen the session if it was closed
    const updatedView = await prisma.videoView.update({
      where: { id: viewId },
      data: {
        stillWatching: true,
        updatedAt: new Date()
      }
    })

    console.log('Resumed session:', updatedView.id, 'with watch time:', updatedView.watchTimeSeconds, 'playhead:', updatedView.playheadPosition)

    return NextResponse.json({
      viewId: updatedView.id,
      playheadPosition: updatedView.playheadPosition,
      watchTimeSeconds: updatedView.watchTimeSeconds,
      resuming: true
    })
    
  } catch (error) {
    console.error('Error resuming video view:', error)
    return NextResponse.json(
      { error: 'Failed to resume video view' },
      { status: 500 }
    )
  }
}