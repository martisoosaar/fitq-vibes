import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function formatVideos(mainVideos: any[], additionalVideos: any[], trainerId: number, categoryIdToName: Map<number, string>) {
  // Remove duplicates and format, tracking if trainer is main or additional
  const uniqueVideos = new Map()
  
  // First add main trainer videos
  mainVideos.forEach(video => {
    if (video && !uniqueVideos.has(video.id)) {
      // Format thumbnail
      let thumbnail = null
      const videoPreview = video.videoPreview || video.video_preview
      const videoPreviewExternal = video.videoPreviewExternal || video.video_preview_external
      if (videoPreview && videoPreview.startsWith('/images/')) {
        thumbnail = videoPreview
      } else if (videoPreviewExternal) {
        thumbnail = videoPreviewExternal
      } else if (videoPreview) {
        if (videoPreview.startsWith('http')) {
          thumbnail = videoPreview
        } else {
          thumbnail = `https://old.fitq.me/storage/${videoPreview}`
        }
      }
      
      uniqueVideos.set(video.id, {
        id: video.id,
        title: video.title,
        duration: formatDuration((video.duration || 0)),
        thumbnail: thumbnail || '/images/video-placeholder.png',
        views: video.views || 0,
        isPremium: !(video.openForFree ?? video.open_for_free ?? false),
        isFree: (video.openForFree ?? video.open_for_free ?? false),
        category: (() => {
          const catId = (video.category ?? video.category_id) as number | undefined
          if (typeof catId === 'number') return categoryIdToName.get(catId) || 'Unknown'
          return 'Unknown'
        })(),
        createdAt: video.createdAt || video.created_at,
        isMainTrainer: video.trainerId === trainerId,
        isAdditionalTrainer: false
      })
    }
  })
  
  // Then add additional trainer videos (from video_trainers table)
  additionalVideos.forEach(vt => {
    const video = (vt as any).videos || (vt as any).video
    if (video && !uniqueVideos.has(video.id)) {
      // Format thumbnail
      let thumbnail = null
      const videoPreview = video.videoPreview || video.video_preview
      const videoPreviewExternal = video.videoPreviewExternal || video.video_preview_external
      if (videoPreview && videoPreview.startsWith('/images/')) {
        thumbnail = videoPreview
      } else if (videoPreviewExternal) {
        thumbnail = videoPreviewExternal
      } else if (videoPreview) {
        if (videoPreview.startsWith('http')) {
          thumbnail = videoPreview
        } else {
          thumbnail = `https://old.fitq.me/storage/${videoPreview}`
        }
      }
      
      uniqueVideos.set(video.id, {
        id: video.id,
        title: video.title,
        duration: formatDuration((video.duration || 0)),
        thumbnail: thumbnail || '/images/video-placeholder.png',
        views: video.views || 0,
        isPremium: !(video.openForFree ?? video.open_for_free ?? false),
        isFree: (video.openForFree ?? video.open_for_free ?? false),
        category: (() => {
          const catId = (video.category ?? video.category_id) as number | undefined
          if (typeof catId === 'number') return categoryIdToName.get(catId) || 'Unknown'
          return 'Unknown'
        })(),
        createdAt: video.createdAt || video.created_at,
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

    // First try to find user by simple_link (username) in legacy users table
    let user = await prisma.users.findFirst({ where: { simple_link: slug } })
    // Fallback: resolve by slugified name if simple_link is missing
    if (!user) {
      const candidates = await prisma.users.findMany({
        where: { trainer_unlocked: true },
        select: { id: true, name: true, simple_link: true }
      })
      const toSlug = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      user = candidates.find(c => c.name && toSlug(c.name) === slug) as any
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const trainerId = Number(user.id)
    
    // Main videos authored by trainer
    const mainVideos = await prisma.videos.findMany({
      where: {
        user_id: trainerId,
        OR: [
          { video_deleted: 0 },
          { video_deleted: null }
        ]
      }
    })

    // Also get videos where this trainer is in video_trainers table
    const additionalVideos = await prisma.videoTrainer.findMany({
      where: {
        trainer_id: BigInt(trainerId)
      },
      include: {
        videos: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Use avatar from User table with proper fallback
    let avatarUrl = null
    if ((user as any).external_avatar) {
      avatarUrl = (user as any).external_avatar
    } else if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        avatarUrl = user.avatar
      } else if (user.avatar.startsWith('/')) {
        avatarUrl = user.avatar
      } else {
        // For old paths like "users/user_73/...", use local files
        avatarUrl = `/${user.avatar}`
      }
    }
    
    // Fallback to default avatar
    if (!avatarUrl) {
      avatarUrl = '/images/default-avatar.png'
    }

    // Determine channel/biography image
    let channelImage = null
    if (user.trainer_channel_image) {
      if (user.trainer_channel_image.startsWith('http')) {
        channelImage = user.trainer_channel_image
      } else {
        channelImage = `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${user.trainer_channel_image}`
      }
    } else if (user.biography_image) {
      if (user.biography_image.startsWith('http')) {
        channelImage = user.biography_image
      } else {
        channelImage = `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${user.biography_image}`
      }
    }

    // Get trainer programs
    const programs = await prisma.trainerProgram.findMany({
      where: { 
        trainer_id: trainerId,
        deleted_at: null
      },
      include: {
        trainer_program_units: true,
        trainer_program_users: true
      }
    })

    // Get social links; followers/testimonials may not exist in schema → default to safe values
    const socialLinks = await prisma.trainerSocialLink.findFirst({
      where: { userId: String(trainerId) }
    })
    const followersCount = 0
    const followingCount = 0
    const followStatus: any = null
    const testimonials: Array<{ rating: number }> = []
    
    // Calculate average rating
    const averageRating = testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : 0
    
    // Build category map for names
    const categories = await prisma.video_categories.findMany({ select: { id: true, name: true } })
    const categoryIdToName = new Map<number, string>(categories.map(c => [Number(c.id), c.name]))

    // Combine and format all videos
    const allVideos = formatVideos(mainVideos, additionalVideos, trainerId, categoryIdToName)
    
    // Format programs
    const formattedPrograms = programs.map(program => ({
      id: program.id.toString(),
      title: program.title,
      description: (program as any).short_description,
      longDescription: program.description,
      picture: program.picture ?
        (program.picture.startsWith('http') ? program.picture : `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${program.picture}`)
        : null,
      urlSlug: (program as any).url_slug,
      unitsCount: (program as any).trainer_program_units?.length || 0,
      enrolledCount: (program as any).trainer_program_users?.length || 0,
      status: program.status,
      unitLength: (program as any).unit_length,
      createdAt: (program as any).created_at
    }))

    const profile = {
      id: String(trainerId),
      username: user.simple_link || String(trainerId),
      name: user.name || '',
      avatar: avatarUrl,
      channelImage: channelImage,
      bio: user.profile_desc || user.trainer_welcome_desc || '',
      welcomeTitle: user.trainer_welcome_title || '',
      location: (() => {
        if (!user.country) return { name: 'Eesti', code: 'EE' }
        try {
          // Parse country if it's a JSON string
          const countryData = typeof user.country === 'string' 
            ? JSON.parse(user.country) 
            : user.country
          return {
            name: countryData.name || 'Eesti',
            code: countryData.id || 'EE'
          }
        } catch {
          // If parsing fails, return default
          return { name: 'Eesti', code: 'EE' }
        }
      })(),
      email: user.email || '',
      isTrainer: true,
      isVerified: !!user.display_on_trainers_list,
      joinedDate: user.created_at || new Date(),
      lastLogin: user.last_login,
      showIntro: user.show_intro === 1,
      iframeIntro: user.trainer_iframe_intro,
      socialMedia: socialLinks ? {
        facebook: socialLinks.facebookLink,
        instagram: socialLinks.instagramLink,
        youtube: socialLinks.youtubeLink,
        tiktok: socialLinks.tiktokLink,
        twitter: socialLinks.twitterLink
      } : null,
      stats: {
        videosCount: allVideos.length,
        programsCount: programs.length,
        rating: averageRating > 0 ? Math.round(averageRating * 10) / 10 : null,
        reviewsCount: testimonials.length,
        followers: followersCount,
        following: followingCount,
        totalViews: user.total_video_views || 0
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