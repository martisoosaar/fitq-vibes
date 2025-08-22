import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const trainerId = searchParams.get('trainer') || ''
    const duration = searchParams.get('duration') || ''
    const equipment = searchParams.get('equipment') || ''
    const language = searchParams.get('language') || ''
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sort = searchParams.get('sort') || 'newest'

    // Build where clause
    const where: any = {
      videoDeleted: false
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { keywords: { contains: search } }
      ]
    }

    if (category) {
      where.categoryId = parseInt(category)
    }

    if (trainerId) {
      where.trainerId = parseInt(trainerId)
    }

    if (duration) {
      switch (duration) {
        case 'short': // 0-20 minutes
          where.duration = { gte: 0, lte: 1200 }
          break
        case 'medium': // 20-45 minutes
          where.duration = { gte: 1200, lte: 2700 }
          break
        case 'long': // 45+ minutes
          where.duration = { gte: 2700 }
          break
      }
    }

    if (equipment) {
      where.equipment = { contains: equipment }
    }

    if (language) {
      where.languageId = parseInt(language)
    }

    // Build order by
    let orderBy: any = {}
    let includeCommentCount = false
    let needsPostSort = false
    switch (sort) {
      case 'popular':
        // For popular, we need to sort by view count after fetching
        needsPostSort = true
        orderBy = { createdAt: 'desc' }
        break
      case 'longest':
        orderBy = { duration: 'desc' }
        break
      case 'shortest':
        orderBy = { duration: 'asc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'most-commented':
        // For most commented, we need to include comment count
        includeCommentCount = true
        needsPostSort = true
        orderBy = { createdAt: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get videos with relations
    const videos = await prisma.video.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        category: true,
        trainer: true,
        language: true,
        user: {
          select: {
            name: true,
            avatar: true,
            externalAvatar: true
          }
        },
        trainers: {
          include: {
            trainer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: { 
            comments: true,
            viewsLog: true 
          }
        }
      }
    })
    
    // Post-sort if needed
    if (sort === 'most-commented') {
      videos.sort((a, b) => (b as any)._count.comments - (a as any)._count.comments)
    } else if (sort === 'popular') {
      videos.sort((a, b) => (b as any)._count.viewsLog - (a as any)._count.viewsLog)
    }

    // Format video data
    const formattedVideos = videos.map(video => {
      // Determine thumbnail (use same logic as single video API)
      let thumbnail = null
      if (video.videoPreview && video.videoPreview.startsWith('/images/')) {
        // Local thumbnail
        thumbnail = video.videoPreview
      } else if (video.videoPreviewExternal) {
        thumbnail = video.videoPreviewExternal
      } else if (video.videoPreview) {
        if (video.videoPreview.startsWith('http')) {
          thumbnail = video.videoPreview
        } else {
          thumbnail = `https://old.fitq.me/storage/${video.videoPreview}`
        }
      }

      // Format duration
      const minutes = Math.floor((video.duration || 0) / 60)
      const seconds = (video.duration || 0) % 60
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`

      return {
        id: video.id,
        title: video.title,
        description: video.description,
        duration: formattedDuration,
        durationSeconds: video.duration,
        category: video.category?.name || 'Unknown',
        categoryId: video.categoryId,
        language: video.language ? {
          id: video.language.id,
          name: video.language.languageName,
          abbr: video.language.languageAbbr,
          flag: video.language.languageFlag
        } : null,
        languageId: video.languageId,
        thumbnail: thumbnail || '/images/video-placeholder.png',
        views: (video as any)._count?.viewsLog || 0,
        commentCount: (video as any)._count?.comments || 0,
        trainer: video.trainer ? {
          id: video.trainerId,
          name: video.trainer.name,
          slug: video.trainer.slug,
          avatar: video.trainer.avatar
        } : null,
        trainers: video.trainers ? video.trainers.map(vt => ({
          id: vt.trainer.id,
          name: vt.trainer.name || vt.trainer.email
        })) : [],
        user: video.user ? {
          name: video.user.name || 'Unknown',
          avatar: video.user.avatar || video.user.externalAvatar
        } : null,
        isPremium: !video.openForFree,
        isFree: video.openForFree,
        openForSubscribers: video.openForSubscribers,
        openForTickets: video.openForTickets,
        singleTicketPrice: video.singleTicketPrice,
        playbackUrl: video.playbackUrl,
        vimeoId: video.vimeoId,
        iframe: video.iframe,
        createdAt: video.createdAt
      }
    })

    // Get total count
    const totalCount = await prisma.video.count({ where })

    // Get categories for filters
    const categories = await prisma.videoCategory.findMany({
      orderBy: { name: 'asc' }
    })

    // Get languages for filters
    const languages = await prisma.language.findMany({
      orderBy: { languageName: 'asc' }
    })

    return NextResponse.json({
      videos: formattedVideos,
      total: totalCount,
      hasMore: offset + limit < totalCount,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image
      })),
      languages: languages.map(lang => ({
        id: lang.id,
        name: lang.languageName,
        abbr: lang.languageAbbr,
        flag: lang.languageFlag
      }))
    })
  } catch (error) {
    console.error('Failed to fetch videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}