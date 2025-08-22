import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        challengeVisible: 1
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        path: true,
        beginDate: true,
        endDate: true,
        minTeam: true,
        maxTeam: true,
        isSubscriptionNeeded: true,
        type: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        beginDate: 'desc'
      }
    })

    // Transform the data for frontend
    const transformedChallenges = challenges.map(challenge => {
      // Fix image URLs - convert old URLs to use the same domain
      let imageUrl = challenge.image
      if (imageUrl) {
        if (imageUrl.startsWith('https://old.fitq.me/storage/')) {
          // Already full URL - keep as is
          imageUrl = imageUrl
        } else if (imageUrl.startsWith('challenges/') || imageUrl.includes('/')) {
          // Relative path - add full URL prefix
          imageUrl = `https://old.fitq.me/storage/${imageUrl}`
        } else if (imageUrl && !imageUrl.startsWith('http')) {
          // Other relative paths
          imageUrl = `https://old.fitq.me/storage/${imageUrl}`
        }
      }

      return {
        id: challenge.id,
        name: challenge.name || '',
        description: challenge.description || '',
        image: imageUrl,
        path: challenge.path || `challenge-${challenge.id}`,
        beginDate: challenge.beginDate,
        endDate: challenge.endDate,
        maxTeam: challenge.maxTeam || 1,
        minTeam: challenge.minTeam || 1,
        isSubscriptionNeeded: challenge.isSubscriptionNeeded === 1,
        type: challenge.type,
        trainer: challenge.user ? {
          id: challenge.user.id,
          name: challenge.user.name || 'Treener',
          avatar: challenge.user.avatar?.startsWith('/') ? challenge.user.avatar : `/${challenge.user.avatar || 'users/default.png'}`,
          slug: challenge.user.name?.toLowerCase().replace(/\s+/g, '') || `user-${challenge.user.id}`
        } : null
      }
    })

    return NextResponse.json(transformedChallenges)
  } catch (error) {
    console.error('Failed to fetch challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}