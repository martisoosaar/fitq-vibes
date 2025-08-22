import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams
    const videoId = searchParams.get('videoId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build where clause
    const where: any = {}
    if (videoId && !isNaN(parseInt(videoId))) where.video_id = parseInt(videoId)
    if (userId && !isNaN(parseInt(userId))) where.user_id = parseInt(userId)
    
    // Get video views from legacy table
    const videoViews = await prisma.video_time_watched_by_users.findMany({
      where,
      select: {
        id: true,
        video_id: true,
        user_id: true,
        trainer_id: true,
        watch_time_seconds: true,
        playhead_position: true,
        calories_burned: true,
        paid: true,
        user_cash: true,
        trainer_cash: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: offset,
      take: limit
    })
    
    // Get related video, user and trainer data
    const videoIds = [...new Set(videoViews.map(v => v.video_id))]
    const userIds = [...new Set(videoViews.map(v => v.user_id))]
    const trainerIds = [...new Set(videoViews.map(v => v.trainer_id))]
    
    const [videos, users, trainers] = await Promise.all([
      prisma.videos.findMany({
        where: { id: { in: videoIds } },
        select: { id: true, title: true, duration: true, video_preview: true, category: true }
      }),
      prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, name: true, avatar: true }
      }),
      prisma.users.findMany({
        where: { id: { in: trainerIds } },
        select: { id: true, email: true, name: true, simple_link: true }
      })
    ])
    
    const videoMap = new Map(videos.map(v => [Number(v.id), v]))
    const userMap = new Map(users.map(u => [Number(u.id), u]))
    const trainerMap = new Map(trainers.map(t => [Number(t.id), t]))
    
    // Format data for frontend
    const formattedViews = videoViews.map(view => ({
      id: view.id,
      videoId: view.video_id,
      userId: view.user_id,
      watchTimeSeconds: view.watch_time_seconds,
      playheadPosition: view.playhead_position || view.watch_time_seconds, // Use actual playhead if available
      stillWatching: false, // Not available in legacy schema
      createdAt: view.created_at,
      updatedAt: view.updated_at,
      caloriesBurned: view.calories_burned,
      paid: Boolean(view.paid),
      userCash: Number(view.user_cash),
      trainerCash: Number(view.trainer_cash),
      video: videoMap.get(Number(view.video_id)) ? {
        id: Number(view.video_id),
        title: videoMap.get(Number(view.video_id))?.title || 'Unknown',
        duration: videoMap.get(Number(view.video_id))?.duration || 0,
        thumbnail: videoMap.get(Number(view.video_id))?.video_preview || null,
        category: null // Will add category lookup later
      } : null,
      user: userMap.get(Number(view.user_id)) ? {
        id: Number(view.user_id),
        email: userMap.get(Number(view.user_id))?.email || '',
        name: userMap.get(Number(view.user_id))?.name || null,
        avatar: userMap.get(Number(view.user_id))?.avatar || null
      } : null,
      trainer: trainerMap.get(Number(view.trainer_id)) ? {
        id: Number(view.trainer_id),
        name: trainerMap.get(Number(view.trainer_id))?.name || '',
        email: trainerMap.get(Number(view.trainer_id))?.email || '',
        slug: trainerMap.get(Number(view.trainer_id))?.simple_link || `user-${view.trainer_id}`
      } : null
    }))
    
    // Calculate stats
    const totalViews = videoViews.length
    const totalWatchTime = videoViews.reduce((sum, v) => sum + (v.watch_time_seconds || 0), 0)
    const averageWatchTime = totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0
    const uniqueViewers = new Set(videoViews.map(v => v.user_id)).size
    
    const stats = {
      totalViews,
      totalWatchTime,
      averageWatchTime,
      uniqueViewers
    }
    
    return NextResponse.json({
      views: formattedViews,
      stats,
      total: totalViews,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalViews / limit)
    })
  } catch (error) {
    console.error('Failed to fetch video views:', error)
    return NextResponse.json({ error: 'Failed to fetch video views' }, { status: 500 })
  }
}