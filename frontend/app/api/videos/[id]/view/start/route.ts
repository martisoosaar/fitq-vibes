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
    console.log('Start view endpoint called for video:', id)
    
    // Get request body
    let forceNew = false
    try {
      const body = await request.json()
      forceNew = body.forceNew || false
    } catch {
      // No body or invalid JSON, use defaults
    }
    
    // Get user from cookies
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh') || cookieStore.get('fitq_impersonate')
    
    if (!refreshCookie) {
      console.log('No auth cookie')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenData = await validateRefreshToken(refreshCookie.value)
    if (!tokenData || !tokenData.user) {
      console.log('Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const userId = tokenData.user.id
    console.log('User ID from cookie:', userId)

    const videoId = parseInt(id)
    if (isNaN(videoId)) {
      console.log('Invalid video ID:', id)
      return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 })
    }

    // Get video details
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        trainerId: true,
        duration: true
      }
    })

    if (!video) {
      console.log('Video not found:', videoId)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    
    console.log('Found video:', video)

    // Close old viewing sessions (older than 1 week)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    await prisma.videoView.updateMany({
      where: {
        userId,
        createdAt: {
          lt: oneWeekAgo
        },
        stillWatching: true
      },
      data: {
        stillWatching: false
      }
    })

    // If not forcing new, check for existing sessions
    if (!forceNew) {
      // Check for existing active viewing session
      const existingView = await prisma.videoView.findFirst({
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

      if (existingView) {
        console.log('Found existing view session:', existingView)
        // Resume existing session
        return NextResponse.json({
          viewId: existingView.id,
          playheadPosition: existingView.playheadPosition,
          watchTimeSeconds: existingView.watchTimeSeconds,
          resuming: true,
          updatedAt: existingView.updatedAt
        })
      }
    }

    // Check if there's a completed session within the last week that we can show for resume
    // Only if not forcing new session
    if (!forceNew) {
      const recentCompletedView = await prisma.videoView.findFirst({
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
        }
      })

      if (recentCompletedView && recentCompletedView.playheadPosition > 0) {
        const videoDurationSeconds = video.duration || 0
        const percentageWatched = videoDurationSeconds > 0 
          ? (recentCompletedView.playheadPosition / videoDurationSeconds) * 100 
          : 0
        
        // If video was less than 80% complete, offer to resume
        if (percentageWatched < 80) {
          console.log('Found recent completed session that can be resumed:', recentCompletedView)
          // Reopen the session for continuation
          const reopenedView = await prisma.videoView.update({
            where: { id: recentCompletedView.id },
            data: {
              stillWatching: true,
              updatedAt: new Date()
            }
          })
          
          return NextResponse.json({
            viewId: reopenedView.id,
            playheadPosition: reopenedView.playheadPosition,
            watchTimeSeconds: reopenedView.watchTimeSeconds,
            resuming: true,
            updatedAt: reopenedView.updatedAt
          })
        }
      }
    }

    console.log('Creating new view session for user:', userId, 'video:', videoId)
    
    // Create new viewing session
    const newView = await prisma.videoView.create({
      data: {
        videoId,
        userId,
        trainerId: video.trainerId,
        watchTimeSeconds: 0,
        playheadPosition: 0,
        stillWatching: true
      }
    })
    
    console.log('Created new view session:', newView)

    return NextResponse.json({
      viewId: newView.id,
      playheadPosition: 0,
      watchTimeSeconds: 0,
      resuming: false
    })
  } catch (error) {
    console.error('Error starting video view:', error)
    return NextResponse.json(
      { error: 'Failed to start video view' },
      { status: 500 }
    )
  }
}