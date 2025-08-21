import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin (simplified for now)
    // In production, you should verify the user's session/token
    
    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams
    const videoId = searchParams.get('videoId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build where clause
    const where: any = {}
    if (videoId && !isNaN(parseInt(videoId))) where.videoId = parseInt(videoId)
    if (userId && !isNaN(parseInt(userId))) where.userId = parseInt(userId)
    
    // Get video views with related data
    const videoViews = await prisma.videoView.findMany({
      where,
      include: {
        video: {
          select: {
            id: true,
            title: true,
            duration: true,
            videoPreview: true,
            categoryId: true,
            category: {
              select: {
                name: true
              }
            },
            trainer: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })
    
    // Get total count for pagination
    const totalCount = await prisma.videoView.count({ where })
    
    // Calculate aggregate statistics
    const stats = await prisma.videoView.aggregate({
      where,
      _sum: {
        watchTimeSeconds: true
      },
      _avg: {
        watchTimeSeconds: true
      },
      _count: {
        id: true
      }
    })
    
    // Get unique viewers count
    const uniqueViewers = await prisma.videoView.groupBy({
      by: ['userId'],
      where,
      _count: {
        id: true
      }
    })
    
    return NextResponse.json({
      views: videoViews,
      totalCount,
      stats: {
        totalViews: stats._count.id,
        totalWatchTime: stats._sum.watchTimeSeconds || 0,
        averageWatchTime: Math.round(stats._avg.watchTimeSeconds || 0),
        uniqueViewers: uniqueViewers.length
      }
    })
    
  } catch (error) {
    console.error('Error fetching video views:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video views' },
      { status: 500 }
    )
  }
}