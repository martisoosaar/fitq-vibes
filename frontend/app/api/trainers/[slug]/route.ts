import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
        programs: true
      }
    })

    if (!trainer) {
      return NextResponse.json(
        { error: 'Trainer not found' },
        { status: 404 }
      )
    }

    // Get associated user data
    const user = await prisma.user.findUnique({
      where: { id: trainer.id },
      select: {
        profileDesc: true,
        trainerChannelImage: true,
        externalAvatar: true
      }
    })

    // Count followers
    const followersCount = await prisma.userFollow.count({
      where: { followingId: trainer.id }
    })

    // Use avatar from Trainer table
    let avatarUrl = trainer.avatar || '/images/trainers/avatar.png'

    const trainerData = {
      id: trainer.id,
      name: trainer.name,
      slug: trainer.slug,
      avatar: avatarUrl,
      channelImage: user?.trainerChannelImage || null,
      description: user?.profileDesc || null,
      videosCount: trainer.videosCount,
      videoViews: trainer.videoViews,
      subscribersCount: followersCount,
      hasPrograms: trainer.programs?.length > 0 || false
    }

    return NextResponse.json({ trainer: trainerData })
  } catch (error) {
    console.error('Failed to fetch trainer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainer' },
      { status: 500 }
    )
  }
}