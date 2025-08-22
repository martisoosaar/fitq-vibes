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
    console.log('Check view endpoint called for video:', id)
    
    // Get user from cookies
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh') || cookieStore.get('fitq_impersonate')
    
    if (!refreshCookie) {
      return NextResponse.json({ hasResumableSession: false })
    }

    const tokenData = await validateRefreshToken(refreshCookie.value)
    if (!tokenData) {
      return NextResponse.json({ hasResumableSession: false })
    }
    
    const userId = Number(tokenData.userId)
    const videoId = parseInt(id)
    
    if (isNaN(videoId)) {
      return NextResponse.json({ hasResumableSession: false })
    }

    // Check for recent viewing session in legacy table
    const recentView = await prisma.video_time_watched_by_users.findFirst({
      where: {
        video_id: videoId,
        user_id: userId,
        watch_time_seconds: {
          gt: 10 // More than 10 seconds watched
        },
        completed_at: null // Only uncompleted sessions
      },
      orderBy: {
        updated_at: 'desc'
      }
    })

    if (recentView) {
      console.log('Found recent session:', recentView.id, 'watch time:', recentView.watch_time_seconds)
      return NextResponse.json({
        hasResumableSession: true,
        viewId: Number(recentView.id),
        playheadPosition: recentView.playhead_position || recentView.watch_time_seconds, // Use playhead if available
        watchTimeSeconds: recentView.watch_time_seconds,
        updatedAt: recentView.updated_at
      })
    }

    // No resumable sessions found
    console.log('No resumable sessions found')
    return NextResponse.json({ hasResumableSession: false })
    
  } catch (error) {
    console.error('Error checking video view:', error)
    return NextResponse.json({ hasResumableSession: false })
  }
}