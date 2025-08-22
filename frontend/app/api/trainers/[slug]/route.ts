import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find trainer user by simple_link in legacy users table
    const trainer = await prisma.users.findFirst({
      where: { simple_link: slug }
    })

    if (!trainer) {
      return NextResponse.json(
        { error: 'Trainer not found' },
        { status: 404 }
      )
    }

    // Get associated user data
    const user = trainer

    // Count followers
    const followersCount = await prisma.user_follow.count({
      where: { following_id: Number(trainer.id) }
    })

    // Use avatar from users table
    let avatarUrl = null as string | null
    if (user?.external_avatar) {
      avatarUrl = user.external_avatar
    } else if (user?.avatar) {
      if (user.avatar.startsWith('http')) {
        avatarUrl = user.avatar
      } else if (user.avatar.startsWith('/')) {
        avatarUrl = user.avatar
      } else {
        avatarUrl = `/${user.avatar}`
      }
    }
    if (!avatarUrl) avatarUrl = '/images/default-avatar.png'

    const trainerData = {
      id: Number(trainer.id),
      name: trainer.name || '',
      slug: trainer.simple_link || String(trainer.id),
      avatar: avatarUrl,
      channelImage: user?.trainer_channel_image || null,
      description: user?.profile_desc || null,
      videosCount: undefined as unknown as number,
      videoViews: trainer.total_video_views || 0,
      subscribersCount: followersCount,
      hasPrograms: (await prisma.trainerProgram.count({ where: { trainer_id: Number(trainer.id), deleted_at: null } })) > 0
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