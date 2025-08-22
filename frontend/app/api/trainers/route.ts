import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause on users table
    const where: any = {
      display_on_trainers_list: true,
      trainer_unlocked: true
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { simple_link: { contains: search } },
        { email: { contains: search } }
      ]
    }

    // Get trainers from users table
    const users = await prisma.users.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: [
        { total_video_views: 'desc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        simple_link: true,
        avatar: true,
        external_avatar: true,
        profile_desc: true,
        display_on_trainers_list: true,
        trainer_channel_image: true,
        total_video_views: true
      }
    })

    // Map to UI payload and compute derived fields
    const trainersWithUserData = await Promise.all(
      users.map(async (u) => {
        // Avatar resolution
        let avatarUrl: string | null = null
        if (u.external_avatar) {
          avatarUrl = u.external_avatar
        } else if (u.avatar) {
          if (u.avatar.startsWith('http')) {
            avatarUrl = u.avatar
          } else if (u.avatar.startsWith('/')) {
            avatarUrl = u.avatar
          } else {
            avatarUrl = `/${u.avatar}`
          }
        }
        if (!avatarUrl) avatarUrl = '/images/default-avatar.png'

        const [programsCount, mainVideosCount, coVideosCount] = await Promise.all([
          prisma.trainerProgram.count({ where: { trainer_id: Number(u.id), deleted_at: null } }),
          prisma.videos.count({ where: { user_id: Number(u.id), OR: [{ video_deleted: 0 }, { video_deleted: null }] } }),
          prisma.videoTrainer.count({ where: { trainer_id: BigInt(Number(u.id)) } })
        ])

        return {
          id: Number(u.id),
          name: u.name || '',
          slug: u.simple_link || (u.name ? u.name.toLowerCase().replace(/\s+/g, '-') : String(u.id)),
          avatar: avatarUrl,
          channelImage: u.trainer_channel_image || null,
          description: u.profile_desc || null,
          videosCount: (mainVideosCount + coVideosCount),
          videoViews: u.total_video_views || 0,
          subscribersCount: Math.floor((u.total_video_views || 0) / 10),
          hasTickets: false,
          hasPrograms: programsCount > 0,
          isVerified: !!u.display_on_trainers_list,
          displayOnList: !!u.display_on_trainers_list
        }
      })
    )

    // Filter out trainers not meant to be displayed
    const displayableTrainers = trainersWithUserData.filter(t => t.displayOnList)

    // Total count for pagination
    const totalCount = await prisma.users.count({ where })
    const hasMore = offset + limit < totalCount

    return NextResponse.json({ trainers: displayableTrainers, hasMore, total: totalCount })
  } catch (error) {
    console.error('Failed to fetch trainers:', error)
    return NextResponse.json({ error: 'Failed to fetch trainers' }, { status: 500 })
  }
}