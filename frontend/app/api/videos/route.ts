import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
      AND: [
        // Show only non-deleted videos
        {
          OR: [
            { video_deleted: 0 },
            { video_deleted: null }
          ]
        }
      ]
    }

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { keywords: { contains: search } }
        ]
      })
    }

    if (category) {
      where.category = parseInt(category)
    }

    if (trainerId) {
      where.user_id = parseInt(trainerId)
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
      where.video_language = language
    }

    // Build order by
    let orderBy: any = {}
    switch (sort) {
      case 'popular':
        orderBy = { views: 'desc' }
        break
      case 'longest':
        orderBy = { duration: 'desc' }
        break
      case 'shortest':
        orderBy = { duration: 'asc' }
        break
      case 'oldest':
        orderBy = { created_at: 'asc' }
        break
      case 'newest':
      default:
        orderBy = { created_at: 'desc' }
    }

    // Get videos with categories
    const videos = await prisma.videos.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      select: {
        id: true,
        user_id: true,
        title: true,
        description: true,
        duration: true,
        category: true,
        views: true,
        vimeo_id: true,
        video_preview: true,
        keywords: true,
        created_at: true,
        updated_at: true,
        video_deleted: true,
        video_language: true
      }
    })
    
    // Get categories for mapping
    const categoryIds = [...new Set(videos.map(v => v.category).filter(Boolean))]
    const categories = await prisma.video_categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    })
    const categoryMap = new Map(categories.map(c => [c.id, c.name]))
    
    // Get trainer and co-trainer info
    const trainerIds = [...new Set(videos.map(v => v.user_id))]
    const trainers = await prisma.users.findMany({
      where: { id: { in: trainerIds } },
      select: { id: true, name: true, simple_link: true, avatar: true, external_avatar: true }
    })
    const trainerMap = new Map(trainers.map(t => [Number(t.id), t]))
    
    // Get co-trainers info
    const videoIds = videos.map(v => v.id)
    const coTrainers = await prisma.videoTrainer.findMany({
      where: { video_id: { in: videoIds } },
      include: {
        users: {
          select: { id: true, name: true, simple_link: true }
        }
      }
    })
    
    // Group co-trainers by video
    const coTrainerMap = new Map<number, any[]>()
    coTrainers.forEach(ct => {
      if (!coTrainerMap.has(ct.video_id)) {
        coTrainerMap.set(ct.video_id, [])
      }
      coTrainerMap.get(ct.video_id)!.push({
        id: Number(ct.users.id),
        name: ct.users.name,
        slug: ct.users.simple_link || ct.users.name?.toLowerCase().replace(/\s+/g, '-') || `user-${ct.users.id}`
      })
    })

    // Format video data
    const formattedVideos = videos.map(video => {
      // Determine thumbnail - prefer local files
      let thumbnail = null
      
      if (video.video_preview) {
        if (video.video_preview.startsWith('/images/')) {
          // Already local thumbnail
          thumbnail = video.video_preview
        } else {
          // Try local files first (both .jpg and .png)
          // Most files are .jpg, but some are .png
          thumbnail = `/images/video-thumbnails/video-${video.id}.jpg`
        }
      } else {
        // Default to local thumbnail by video ID
        thumbnail = `/images/video-thumbnails/video-${video.id}.jpg`
      }

      return {
        id: video.id,
        title: video.title || 'Nimetu video',
        description: video.description || '',
        duration: `${Math.floor((video.duration || 0) / 60)}:${((video.duration || 0) % 60).toString().padStart(2, '0')}`,
        durationSeconds: video.duration || 0,
        thumbnail: thumbnail,
        views: video.views || 0,
        categoryId: video.category,
        category: video.category ? categoryMap.get(video.category) || null : null,
        trainerId: video.user_id,
        trainer: trainerMap.get(video.user_id) ? {
          id: Number(trainerMap.get(video.user_id)!.id),
          name: trainerMap.get(video.user_id)!.name || '',
          slug: trainerMap.get(video.user_id)!.simple_link || trainerMap.get(video.user_id)!.name?.toLowerCase().replace(/\s+/g, '-') || `user-${video.user_id}`,
          avatar: trainerMap.get(video.user_id)!.external_avatar || 
                  (trainerMap.get(video.user_id)!.avatar ? `/${trainerMap.get(video.user_id)!.avatar}` : null)
        } : null,
        trainers: coTrainerMap.get(video.id) || [],
        vimeoId: video.vimeo_id || null,
        createdAt: video.created_at,
        equipment: null,
        keywords: video.keywords,
        languageId: parseInt(video.video_language) || 1,
        openForFree: true, // Default for legacy videos
        openForSubscribers: true,
        playbackUrl: null,
        language: { 
          abbr: video.video_language === '1' ? 'en' :     // ID 1 = english
                video.video_language === '2' ? 'est' :    // ID 2 = estonian
                video.video_language === '3' ? 'ru' :     // ID 3 = russian
                video.video_language === '4' ? 'lat' :    // ID 4 = latvian
                video.video_language === '6' ? 'lt' : 'est', // ID 6 = lithuanian
          name: video.video_language === '1' ? 'english' : 
                video.video_language === '2' ? 'estonian' : 
                video.video_language === '3' ? 'russian' :
                video.video_language === '4' ? 'latvian' :
                video.video_language === '6' ? 'lithuanian' : 'estonian'
        }
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.videos.count({ where })

    // Get all categories for filters
    const allCategories = await prisma.video_categories.findMany({
      select: { id: true, name: true }
    })
    
    // Get all languages for filters
    const allLanguages = await prisma.languages.findMany({
      select: { id: true, language_name: true, language_abbr: true }
    })

    return NextResponse.json({
      videos: formattedVideos,
      totalCount,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: (offset + limit) < totalCount,
      categories: allCategories.map(c => ({
        id: c.id,
        name: c.name
      })),
      languages: allLanguages.map(l => ({
        id: l.id,
        name: l.language_name,
        abbr: l.language_abbr
      }))
    })
  } catch (error) {
    console.error('Failed to fetch videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}