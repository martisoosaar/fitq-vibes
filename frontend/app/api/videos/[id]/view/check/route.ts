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
    if (!tokenData || !tokenData.user) {
      return NextResponse.json({ hasResumableSession: false })
    }
    
    const userId = tokenData.user.id
    const videoId = parseInt(id)
    
    if (isNaN(videoId)) {
      return NextResponse.json({ hasResumableSession: false })
    }

    // Check for sessions within the last week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    // First check for active sessions
    const activeView = await prisma.videoView.findFirst({
      where: {
        videoId,
        userId,
        stillWatching: true,
        createdAt: {
          gte: oneWeekAgo
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (activeView) {
      console.log('Found active session:', activeView.id)
      return NextResponse.json({
        hasResumableSession: true,
        viewId: activeView.id,
        playheadPosition: activeView.playheadPosition,
        watchTimeSeconds: activeView.watchTimeSeconds,
        updatedAt: activeView.updatedAt
      })
    }

    // Check for recent incomplete sessions
    const recentView = await prisma.videoView.findFirst({
      where: {
        videoId,
        userId,
        stillWatching: false,
        createdAt: {
          gte: oneWeekAgo
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        video: {
          select: {
            duration: true
          }
        }
      }
    })

    if (recentView && recentView.playheadPosition > 0) {
      const videoDurationSeconds = recentView.video.duration || 0
      const percentageWatched = videoDurationSeconds > 0 
        ? (recentView.playheadPosition / videoDurationSeconds) * 100 
        : 0
      
      // If video was less than 80% complete, it's resumable
      if (percentageWatched < 80) {
        console.log('Found resumable completed session:', recentView.id)
        return NextResponse.json({
          hasResumableSession: true,
          viewId: recentView.id,
          playheadPosition: recentView.playheadPosition,
          watchTimeSeconds: recentView.watchTimeSeconds,
          updatedAt: recentView.updatedAt
        })
      }
    }

    // No resumable session found
    return NextResponse.json({
      hasResumableSession: false
    })
    
  } catch (error) {
    console.error('Error checking video view:', error)
    return NextResponse.json(
      { hasResumableSession: false },
      { status: 200 } // Return 200 even on error to not block playback
    )
  }
}