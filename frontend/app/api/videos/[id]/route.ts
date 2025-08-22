import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const videoId = parseInt(id)
    
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    // Get video from legacy videos table
    const video = await prisma.videos.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        category: true,
        user_id: true,
        views: true,
        vimeo_id: true,
        video_preview: true,
        keywords: true,
        created_at: true,
        video_language: true,
        video_deleted: true,
        iframe: true,
        equipment: true
      }
    })


    
    if (!video || video.video_deleted === 1) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Auto-cleanup: Mark old viewing sessions as completed (pseudo-cronjob)
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const cleanupResult = await prisma.video_time_watched_by_users.updateMany({
        where: {
          updated_at: {
            lt: oneWeekAgo
          },
          completed_at: null // Only update uncompleted sessions
        },
        data: {
          completed_at: new Date()
        }
      })
      
      if (cleanupResult.count > 0) {
        console.log(`🧹 Auto-cleanup: Marked ${cleanupResult.count} old viewing sessions as completed`)
      }
    } catch (cleanupError) {
      console.error('Auto-cleanup error (non-critical):', cleanupError)
      // Don't fail the whole request if cleanup fails
    }

    // Get trainer info
    const trainer = await prisma.users.findUnique({
      where: { id: video.user_id },
      select: {
        id: true,
        name: true,
        simple_link: true,
        avatar: true,
        external_avatar: true,
        profile_desc: true
      }
    })

    // Get co-trainers
    const coTrainers = await prisma.videoTrainer.findMany({
      where: { video_id: videoId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            simple_link: true,
            avatar: true,
            external_avatar: true
          }
        }
      }
    })

    // Get category name
    const category = await prisma.video_categories.findUnique({
      where: { id: video.category },
      select: { id: true, name: true }
    })

    // Get language info
    const language = await prisma.languages.findUnique({
      where: { id: parseInt(video.video_language || '2') },
      select: { id: true, language_name: true, language_abbr: true }
    })

    // Format trainer avatar
    let trainerAvatar = null
    if (trainer) {
      if (trainer.external_avatar) {
        trainerAvatar = trainer.external_avatar
      } else if (trainer.avatar) {
        if (trainer.avatar.startsWith('http') || trainer.avatar.startsWith('/')) {
          trainerAvatar = trainer.avatar
        } else {
          trainerAvatar = `/${trainer.avatar}`
        }
      }
    }

    // Format video thumbnail
    let thumbnail = null
    if (video.video_preview) {
      if (video.video_preview.startsWith('/images/')) {
        thumbnail = video.video_preview
      } else {
        thumbnail = `/images/video-thumbnails/video-${video.id}.jpg`
      }
    } else {
      thumbnail = `/images/video-thumbnails/video-${video.id}.jpg`
    }

    // Format co-trainers
    const formattedCoTrainers = coTrainers.map(ct => {
      let coTrainerAvatar = null
      if (ct.users.external_avatar) {
        coTrainerAvatar = ct.users.external_avatar
      } else if (ct.users.avatar) {
        if (ct.users.avatar.startsWith('http') || ct.users.avatar.startsWith('/')) {
          coTrainerAvatar = ct.users.avatar
        } else {
          coTrainerAvatar = `/${ct.users.avatar}`
        }
      }

      return {
        id: Number(ct.users.id),
        name: ct.users.name || '',
        avatar: coTrainerAvatar,
        slug: ct.users.simple_link || ct.users.name?.toLowerCase().replace(/\s+/g, '-') || `user-${ct.users.id}`
      }
    })

    // Get related videos (same category, different video)
    const relatedVideos = await prisma.videos.findMany({
      where: {
        category: video.category,
        id: { not: videoId },
        OR: [
          { video_deleted: 0 },
          { video_deleted: null }
        ]
      },
      select: {
        id: true,
        title: true,
        duration: true,
        views: true,
        user_id: true
      },
      take: 6,
      orderBy: { views: 'desc' }
    })

    // Format related videos with thumbnails
    const formattedRelatedVideos = relatedVideos.map(rv => ({
      id: rv.id,
      title: rv.title,
      duration: `${Math.floor((rv.duration || 0) / 60)}:${((rv.duration || 0) % 60).toString().padStart(2, '0')}`,
      thumbnail: `/images/video-thumbnails/video-${rv.id}.jpg`,
      category: category?.name || '',
      trainer: null, // Will be filled if needed
      views: rv.views || 0
    }))

    // Format response to match original structure
    const response = {
      id: video.id,
      title: video.title,
      description: video.description,
      duration: `${Math.floor((video.duration || 0) / 60)}:${((video.duration || 0) % 60).toString().padStart(2, '0')}`,
      durationSeconds: video.duration || 0,
      category: category?.name || '',
      categoryId: video.category,
      thumbnail: thumbnail,
      views: video.views || 0,
      language: language ? {
        id: language.id,
        languageName: language.language_name,
        languageAbbr: language.language_abbr,
        languageFlag: null
      } : null,
      trainer: trainer ? {
        id: Number(trainer.id),
        name: trainer.name || '',
        slug: trainer.simple_link || trainer.name?.toLowerCase().replace(/\s+/g, '-') || `user-${trainer.id}`,
        avatar: trainerAvatar
      } : null,
      trainers: formattedCoTrainers,
      user: trainer ? {
        id: Number(trainer.id),
        name: trainer.name || '',
        avatar: trainerAvatar,
        description: trainer.profile_desc
      } : { id: 0, name: 'Unknown', avatar: null, description: null },
      isPremium: false, // Default for legacy videos
      isFree: true,
      openForSubscribers: true,
      openForTickets: false,
      singleTicketPrice: 0,
      playbackUrl: null,
      vimeoId: video.vimeo_id,
      iframe: video.iframe,
      videoLanguage: video.video_language,
      equipment: video.equipment,
      keywords: video.keywords,
      energyConsumption: null, // Not available in current select
      createdAt: video.created_at,
      relatedVideos: formattedRelatedVideos
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch video:', error)
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
  }
}