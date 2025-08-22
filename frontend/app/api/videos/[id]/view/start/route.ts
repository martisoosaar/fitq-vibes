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
    if (!tokenData) {
      console.log('Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const userId = Number(tokenData.userId)
    console.log('User ID from cookie:', userId)

    const videoId = parseInt(id)
    if (isNaN(videoId)) {
      console.log('Invalid video ID:', id)
      return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 })
    }

    // Get video details
    const video = await prisma.videos.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        user_id: true,
        duration: true
      }
    })

    if (!video) {
      console.log('Video not found:', videoId)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    console.log('Found video:', video)

    // Create simple viewing session in legacy table
    const newView = await prisma.video_time_watched_by_users.create({
      data: {
        user_id: userId,
        video_id: videoId,
        trainer_id: video.user_id || 0,
        watch_time_seconds: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    console.log('Created view session:', newView.id)

    return NextResponse.json({
      viewId: newView.id,
      watchTimeSeconds: 0,
      playheadPosition: 0,
      resumed: false
    })
  } catch (error) {
    console.error('Error starting video view:', error)
    return NextResponse.json({ error: 'Failed to start video view' }, { status: 500 })
  }
}