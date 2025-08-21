import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Get video with all relations
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        videoDeleted: false
      },
      include: {
        category: true,
        trainer: true,
        language: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            externalAvatar: true,
            profileDesc: true
          }
        },
        trainers: {
          include: {
            trainer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                externalAvatar: true
              }
            }
          }
        },
        musicCopyrights: {
          select: {
            id: true,
            title: true,
            artist: true,
            data: true
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Note: View count is now tracked via /track endpoint when user actually watches

    // Format video data
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

    // Get related videos from same category
    const relatedVideos = await prisma.video.findMany({
      where: {
        categoryId: video.categoryId,
        videoDeleted: false,
        id: { not: videoId }
      },
      take: 6,
      orderBy: { views: 'desc' },
      include: {
        category: true,
        trainer: true
      }
    })

    const formattedRelated = relatedVideos.map(v => ({
      id: v.id,
      title: v.title,
      duration: `${Math.floor((v.duration || 0) / 60)}:${((v.duration || 0) % 60).toString().padStart(2, '0')}`,
      thumbnail: v.videoPreview && v.videoPreview.startsWith('/images/') 
                ? v.videoPreview
                : v.videoPreviewExternal || 
                  (v.videoPreview ? 
                    (v.videoPreview.startsWith('http') ? v.videoPreview : `https://old.fitq.me/storage/${v.videoPreview}`) 
                    : '/images/video-placeholder.png'),
      category: v.category?.name || 'Unknown',
      trainer: v.trainer ? {
        name: v.trainer.name,
        slug: v.trainer.slug
      } : null,
      views: v.views || 0
    }))

    const response = {
      id: video.id,
      title: video.title,
      description: video.description,
      duration: formattedDuration,
      durationSeconds: video.duration,
      category: video.category?.name || 'Unknown',
      categoryId: video.categoryId,
      thumbnail: thumbnail || '/images/video-placeholder.png',
      views: video.views || 0, // Show actual tracked views
      language: video.language ? {
        id: video.language.id,
        languageName: video.language.languageName,
        languageAbbr: video.language.languageAbbr,
        languageFlag: video.language.languageFlag
      } : null,
      trainer: video.trainer ? {
        id: video.trainerId,
        name: video.trainer.name,
        slug: video.trainer.slug,
        avatar: video.trainer.avatar
      } : null,
      trainers: video.trainers.map(vt => ({
        id: vt.trainer.id,
        name: vt.trainer.name || vt.trainer.email,
        avatar: vt.trainer.externalAvatar || vt.trainer.avatar,
        slug: vt.trainer.name ? vt.trainer.name.toLowerCase().replace(/\s+/g, '') : vt.trainer.id.toString()
      })),
      user: {
        id: video.user.id,
        name: video.user.name || 'Unknown',
        avatar: video.user.avatar || video.user.externalAvatar,
        description: video.user.profileDesc
      },
      isPremium: !video.openForFree,
      isFree: video.openForFree,
      openForSubscribers: video.openForSubscribers,
      openForTickets: video.openForTickets,
      singleTicketPrice: video.singleTicketPrice,
      playbackUrl: video.playbackUrl,
      vimeoId: video.vimeoId,
      iframe: video.iframe,
      videoLanguage: video.videoLanguage,
      equipment: video.equipment,
      keywords: video.keywords,
      energyConsumption: video.energyConsumption,
      createdAt: video.createdAt,
      relatedVideos: formattedRelated,
      musicCopyrights: video.musicCopyrights
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}