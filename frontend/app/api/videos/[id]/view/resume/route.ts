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
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const userId = Number(tokenData.userId)
    const videoId = parseInt(id)
    
    if (isNaN(videoId)) {
      return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 })
    }

    // Find and reopen the session
    const existingView = await prisma.video_time_watched_by_users.findFirst({
      where: {
        id: viewId,
        video_id: videoId,
        user_id: userId
      }
    })

    if (!existingView) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Reopen the session if it was closed
    const updatedView = await prisma.video_time_watched_by_users.update({
      where: { id: viewId },
      data: {
        updated_at: new Date()
      }
    })

    console.log('Resumed session:', updatedView.id, 'with watch time:', updatedView.watch_time_seconds)

    return NextResponse.json({
      viewId: Number(updatedView.id),
      playheadPosition: updatedView.playhead_position || updatedView.watch_time_seconds, // Use playhead if available
      watchTimeSeconds: updatedView.watch_time_seconds,
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