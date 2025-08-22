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

    const body = await request.json()
    const { viewId, watchTimeSeconds, playheadPosition, isComplete } = body

    if (!viewId || typeof watchTimeSeconds !== 'number' || typeof playheadPosition !== 'number') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Get video duration for completion check
    const video = await prisma.videos.findUnique({
      where: { id: videoId },
      select: {
        duration: true
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Duration is already in seconds as an Int in the database
    const videoDurationSeconds = video.duration || 0
    
    // Validate and cap watch time and playhead position to not exceed video duration
    const cappedWatchTime = Math.min(watchTimeSeconds, videoDurationSeconds)
    const cappedPlayhead = Math.min(playheadPosition, videoDurationSeconds)
    
    if (watchTimeSeconds > videoDurationSeconds) {
      console.warn(`Watch time (${watchTimeSeconds}s) exceeds video duration (${videoDurationSeconds}s) for video ${videoId}. Capping to duration.`)
    }
    
    // Check if video is complete
    let shouldComplete = false
    if (videoDurationSeconds > 0) {
      const percentageWatched = (cappedPlayhead / videoDurationSeconds) * 100
      
      if (videoDurationSeconds > 300) { // More than 5 minutes
        shouldComplete = percentageWatched >= 90
      } else { // 5 minutes or less
        shouldComplete = percentageWatched >= 80
      }
    }

    // Update the viewing session with capped values
    const updatedView = await prisma.video_time_watched_by_users.update({
      where: { id: viewId },
      data: {
        watch_time_seconds: cappedWatchTime,
        playhead_position: cappedPlayhead,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      stillWatching: !shouldComplete, // Calculate from completion logic
      isComplete: shouldComplete
    })
  } catch (error) {
    console.error('Error updating video view:', error)
    return NextResponse.json(
      { error: 'Failed to update video view' },
      { status: 500 }
    )
  }
}