import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { slug: { contains: search } }
      ]
    } : {}

    // Get trainers with their associated user data
    const trainers = await prisma.trainer.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: [
        { videoViews: 'desc' },
        { name: 'asc' }
      ],
      include: {
        programs: true
      }
    })

    // Get associated user data for each trainer
    const trainersWithUserData = await Promise.all(
      trainers.map(async (trainer) => {
        const user = await prisma.user.findUnique({
          where: { id: trainer.id },
          select: {
            profileDesc: true,
            displayOnTrainersList: true,
            trainerChannelImage: true,
            externalAvatar: true
          }
        })

        // Use avatar from Trainer table (already fixed with local paths)
        let avatarUrl = trainer.avatar || '/images/trainers/avatar.png'

        return {
          id: trainer.id,
          name: trainer.name,
          slug: trainer.slug,
          avatar: avatarUrl,
          channelImage: user?.trainerChannelImage || null,
          description: user?.profileDesc || null,
          videosCount: trainer.videosCount,
          videoViews: trainer.videoViews,
          subscribersCount: Math.floor(trainer.videoViews / 10), // Estimated
          hasTickets: false, // Will be updated when we add tickets
          hasPrograms: trainer.programs?.length > 0 || false,
          isVerified: user?.displayOnTrainersList === 1,
          displayOnList: user?.displayOnTrainersList === 1
        }
      })
    )

    // Filter out trainers not meant to be displayed
    const displayableTrainers = trainersWithUserData.filter(t => t.displayOnList)

    // Check if there are more trainers
    const totalCount = await prisma.trainer.count({ where })
    const hasMore = offset + limit < totalCount

    return NextResponse.json({
      trainers: displayableTrainers,
      hasMore,
      total: totalCount
    })
  } catch (error) {
    console.error('Failed to fetch trainers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainers' },
      { status: 500 }
    )
  }
}