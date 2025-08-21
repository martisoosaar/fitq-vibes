import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { validateRefreshToken } from '@/lib/repo/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get user from refresh token (check impersonate first)
    const cookieStore = await cookies()
    const impersonateCookie = cookieStore.get('fitq_impersonate')
    const refreshCookie = impersonateCookie || cookieStore.get('fitq_refresh')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate the refresh token and get user
    const tokenData = await validateRefreshToken(refreshCookie.value)
    
    if (!tokenData || !tokenData.user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const user = tokenData.user
    const userId = user.id

    // Check if user is a trainer
    if (!user.trainerUnlocked) {
      return NextResponse.json({ error: 'Not a trainer' }, { status: 403 })
    }

    // Find the trainer record for this user
    // First check by name match
    const trainer = await prisma.trainer.findFirst({
      where: {
        OR: [
          { name: user.name },
          { slug: user.simpleLink || '' }
        ]
      }
    })

    if (!trainer) {
      console.log('No trainer record found for user:', user.name)
      return NextResponse.json({ videos: [], stats: { totalWatchTimeSeconds: 0, uniqueViewersCount: 0 } })
    }

    const trainerId = trainer.id

    console.log('Fetching videos for trainer:', {
      userId,
      trainerId,
      trainerName: trainer.name,
      userEmail: user.email
    })

    // Get videos where user is the main trainer
    const ownedVideos = await prisma.video.findMany({
      where: {
        trainerId: trainerId,
        videoDeleted: false
      },
      select: {
        id: true,
        title: true,
        duration: true,
        views: true,
        videoPreview: true,
        vimeoId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get videos where user is a co-trainer
    const coTrainerVideos = await prisma.videoTrainer.findMany({
      where: {
        trainerId: trainerId
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            duration: true,
            views: true,
            videoPreview: true,
            vimeoId: true,
            createdAt: true
          }
        }
      }
    })

    // Get watch time for each video
    const allVideoIds = [
      ...ownedVideos.map(v => v.id),
      ...coTrainerVideos.map(vt => vt.video.id)
    ]
    
    const videoWatchTimes = await prisma.videoView.groupBy({
      by: ['videoId'],
      where: {
        videoId: { in: allVideoIds }
      },
      _sum: {
        watchTimeSeconds: true
      }
    })
    
    // Create a map for easy lookup
    const watchTimeMap = new Map(
      videoWatchTimes.map(item => [item.videoId, item._sum.watchTimeSeconds || 0])
    )
    
    // Combine and format videos
    const videos = [
      ...ownedVideos.map(video => ({
        id: video.id,
        title: video.title,
        duration: video.duration || 0,
        views: video.views || 0,
        totalWatchTime: watchTimeMap.get(video.id) || 0,
        thumbnail: video.videoPreview ? (
          video.videoPreview.startsWith('http') 
            ? video.videoPreview 
            : video.videoPreview.startsWith('/images/')
              ? video.videoPreview
              : `/images/video-thumbnails/${video.videoPreview}`
        ) : null,
        vimeoId: video.vimeoId,
        createdAt: video.createdAt?.toISOString() || new Date().toISOString(),
        isOwner: true
      })),
      ...coTrainerVideos.map(vt => ({
        id: vt.video.id,
        title: vt.video.title,
        duration: vt.video.duration || 0,
        views: vt.video.views || 0,
        totalWatchTime: watchTimeMap.get(vt.video.id) || 0,
        thumbnail: vt.video.videoPreview ? (
          vt.video.videoPreview.startsWith('http') 
            ? vt.video.videoPreview 
            : vt.video.videoPreview.startsWith('/images/')
              ? vt.video.videoPreview
              : `/images/video-thumbnails/${vt.video.videoPreview}`
        ) : null,
        vimeoId: vt.video.vimeoId,
        createdAt: vt.video.createdAt?.toISOString() || new Date().toISOString(),
        isOwner: false
      }))
    ]

    // Sort by created date, newest first
    videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log(`Found ${ownedVideos.length} owned videos and ${coTrainerVideos.length} co-trainer videos`)

    // Get total watch time for all trainer's videos
    const videoIds = ownedVideos.map(v => v.id)
    const totalWatchTime = await prisma.videoView.aggregate({
      where: {
        videoId: { in: videoIds }
      },
      _sum: {
        watchTimeSeconds: true
      }
    })

    // Get unique viewers count
    const uniqueViewers = await prisma.videoView.groupBy({
      by: ['userId'],
      where: {
        videoId: { in: videoIds }
      }
    })

    return NextResponse.json({
      videos,
      stats: {
        totalWatchTimeSeconds: totalWatchTime._sum.watchTimeSeconds || 0,
        uniqueViewersCount: uniqueViewers.length
      }
    })
  } catch (error) {
    console.error('Failed to fetch trainer videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}