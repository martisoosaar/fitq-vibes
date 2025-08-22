import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const videoId = parseInt(id)
    
    console.log(`🎬 Video tracking API called for video ${videoId}`)
    
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    // Get user from JWT token
    const token = request.cookies.get('access_token')?.value
    
    if (!token) {
      // Allow anonymous tracking but don't save to database
      return NextResponse.json({ success: true, message: 'Anonymous tracking' })
    }

    let userId: number
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch {
      return NextResponse.json({ success: true, message: 'Invalid token' })
    }

    const body = await request.json()
    const { watchTimeSeconds, totalDuration, isComplete } = body

    if (typeof watchTimeSeconds !== 'number' || watchTimeSeconds < 0) {
      return NextResponse.json(
        { error: 'Invalid watch time' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if user has existing view record for this video today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingView = await prisma.videoView.findFirst({
      where: {
        videoId,
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (existingView) {
      // Update existing view record with new watch time
      await prisma.videoView.update({
        where: { id: existingView.id },
        data: {
          watchTimeSeconds: Math.max(existingView.watchTimeSeconds, watchTimeSeconds),
          updatedAt: new Date()
        }
      })
    } else {
      // Create new view record and increment video views counter
      await prisma.$transaction([
        // Create the view record
        prisma.videoView.create({
          data: {
            videoId,
            userId,
            trainerId: video.trainerId,
            watchTimeSeconds,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }),
        // Increment the video views counter
        prisma.video.update({
          where: { id: videoId },
          data: { 
            views: { increment: 1 }
          }
        })
      ])
    }

    // Calculate estimated calories burned (rough estimate: 5 calories per minute)
    const estimatedCalories = Math.round((watchTimeSeconds / 60) * 5)
    
    // Update calories if watch time is significant (> 5 minutes) and video is mostly watched
    if (watchTimeSeconds > 300 && video.duration && watchTimeSeconds > video.duration * 0.7) {
      await prisma.videoView.updateMany({
        where: {
          videoId,
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        data: {
          caloriesBurned: estimatedCalories
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      watchTime: watchTimeSeconds,
      estimatedCalories: estimatedCalories
    })

  } catch (error) {
    console.error('Failed to track video view:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}