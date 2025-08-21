import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function formatVideos(mainVideos: any[], additionalVideos: any[], trainerId: number) {
  // Remove duplicates and format, tracking if trainer is main or additional
  const uniqueVideos = new Map()
  
  // First add main trainer videos
  mainVideos.forEach(video => {
    if (video && !uniqueVideos.has(video.id)) {
      // Format thumbnail
      let thumbnail = null
      if (video.videoPreview && video.videoPreview.startsWith('/images/')) {
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
      
      uniqueVideos.set(video.id, {
        id: video.id,
        title: video.title,
        duration: formatDuration(video.duration || 0),
        thumbnail: thumbnail || '/images/video-placeholder.png',
        views: video.views || 0,
        isPremium: !video.openForFree,
        isFree: video.openForFree,
        category: video.category?.name || 'Unknown',
        createdAt: video.createdAt,
        isMainTrainer: video.trainerId === trainerId,
        isAdditionalTrainer: false
      })
    }
  })
  
  // Then add additional trainer videos (from video_trainers table)
  additionalVideos.forEach(vt => {
    const video = vt.video
    if (video && !uniqueVideos.has(video.id)) {
      // Format thumbnail
      let thumbnail = null
      if (video.videoPreview && video.videoPreview.startsWith('/images/')) {
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
      
      uniqueVideos.set(video.id, {
        id: video.id,
        title: video.title,
        duration: formatDuration(video.duration || 0),
        thumbnail: thumbnail || '/images/video-placeholder.png',
        views: video.views || 0,
        isPremium: !video.openForFree,
        isFree: video.openForFree,
        category: video.category?.name || 'Unknown',
        createdAt: video.createdAt,
        isMainTrainer: false,
        isAdditionalTrainer: true
      })
    }
  })
  
  // Convert to array and sort by date
  return Array.from(uniqueVideos.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find trainer by slug
    const trainer = await prisma.trainer.findUnique({
      where: { slug },
      include: {
        videos: {
          where: {
            videoDeleted: false
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20,
          include: {
            category: true
          }
        }
      }
    })

    if (!trainer) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get associated user data
    const user = await prisma.user.findUnique({
      where: { id: trainer.id },
      select: {
        name: true,
        email: true,
        profileDesc: true,
        avatar: true,
        externalAvatar: true,
        trainerChannelImage: true,
        biographyImage: true,
        trainerWelcomeTitle: true,
        trainerWelcomeDesc: true,
        trainerIframeIntro: true,
        showIntro: true,
        displayOnTrainersList: true,
        country: true,
        createdAt: true,
        lastLogin: true,
        totalVideoViews: true
      }
    })
    
    // Also get videos where this trainer is in video_trainers table
    const additionalVideos = await prisma.videoTrainer.findMany({
      where: {
        trainerId: trainer.id
      },
      include: {
        video: {
          include: {
            category: true
          }
        }
      },
      take: 20,
      orderBy: {
        video: {
          createdAt: 'desc'
        }
      }
    })

    // Use avatar from Trainer table (already fixed with local paths)
    let avatarUrl = trainer.avatar || '/images/trainers/avatar.png'

    // Determine channel/biography image
    let channelImage = null
    if (user?.trainerChannelImage) {
      if (user.trainerChannelImage.startsWith('http')) {
        channelImage = user.trainerChannelImage
      } else {
        channelImage = `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${user.trainerChannelImage}`
      }
    } else if (user?.biographyImage) {
      if (user.biographyImage.startsWith('http')) {
        channelImage = user.biographyImage
      } else {
        channelImage = `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${user.biographyImage}`
      }
    }

    // Get trainer programs
    const programs = await prisma.trainerProgram.findMany({
      where: { 
        trainerId: trainer.id,
        deletedAt: null
      },
      include: {
        units: true,
        users: true
      }
    })

    // Get follower and following counts
    const [followersCount, followingCount, followStatus] = await Promise.all([
      prisma.userFollow.count({
        where: { 
          followingId: trainer.id,
          status: 'active'
        }
      }),
      prisma.userFollow.count({
        where: { 
          followerId: trainer.id,
          status: 'active'
        }
      }),
      // Check if current user (Marti) is following this trainer
      prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: 73, // Marti's ID
            followingId: trainer.id
          }
        }
      })
    ])
    
    // Combine and format all videos
    const allVideos = formatVideos(
      trainer.videos,
      additionalVideos,
      trainer.id
    )
    
    // Format programs
    const formattedPrograms = programs.map(program => ({
      id: program.id.toString(),
      title: program.title,
      description: program.shortDescription,
      longDescription: program.description,
      picture: program.picture ? 
        (program.picture.startsWith('http') ? program.picture : 
         `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${program.picture}`) 
        : null,
      urlSlug: program.urlSlug,
      unitsCount: program.units?.length || 0,
      enrolledCount: program.users?.length || 0,
      status: program.status,
      unitLength: program.unitLength,
      createdAt: program.createdAt
    }))

    const profile = {
      id: trainer.id.toString(),
      username: trainer.slug,
      name: trainer.name,
      avatar: avatarUrl,
      channelImage: channelImage,
      bio: user?.profileDesc || user?.trainerWelcomeDesc || '',
      welcomeTitle: user?.trainerWelcomeTitle || '',
      location: user?.country || 'Eesti',
      email: user?.email || '',
      isTrainer: true,
      isVerified: user?.displayOnTrainersList === 1,
      joinedDate: user?.createdAt || new Date(),
      lastLogin: user?.lastLogin,
      showIntro: user?.showIntro === 1,
      iframeIntro: user?.trainerIframeIntro,
      stats: {
        videosCount: allVideos.length, // Use actual count of videos
        programsCount: programs.length,
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        reviewsCount: Math.floor(trainer.videoViews / 100),
        followers: followersCount,
        following: followingCount,
        totalViews: trainer.videoViews || 0
      },
      isFollowing: !!followStatus,
      followStatus: followStatus?.status || null,
      videos: allVideos,
      programs: formattedPrograms
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}