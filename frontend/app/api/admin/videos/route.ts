import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const where: any = {
      OR: [
        { video_deleted: 0 },
        { video_deleted: null }
      ]
    }
    
    if (search) {
      where.AND = [
        where.OR, // Keep the video_deleted filter
        {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { keywords: { contains: search } }
          ]
        }
      ]
      delete where.OR // Remove the original OR to avoid conflict
    }
    
    const queryOptions: any = {
      where,
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        views: true,
        hidden: true,
        created_at: true,
        user_id: true,
        category: true
      },
      orderBy: {
        created_at: 'desc'
      }
    }
    
    // Limit results for performance
    queryOptions.take = 500
    
    const videos = await prisma.videos.findMany(queryOptions)
    
    // Get user info for each video
    const userIds = [...new Set(videos.map(v => v.user_id))]
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    })
    const userMap = new Map(users.map(u => [u.id, u]))
    
    // Format videos with user info
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      duration: video.duration,
      views: video.views || 0,
      hidden: Boolean(video.hidden),
      createdAt: video.created_at,
      categoryId: video.category,
      category: null, // Will be filled when we add category lookup
      trainer: userMap.get(video.user_id) || null,
      user: userMap.get(video.user_id) || null
    }))

    return NextResponse.json(formattedVideos)
  } catch (error) {
    console.error('Failed to fetch videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}