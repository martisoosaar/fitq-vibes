import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        challenge_visible: 1
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        path: true,
        begin_date: true,
        end_date: true,
        min_team: true,
        max_team: true,
        is_subscription_needed: true,
        type: true,
        user_id: true,
      },
      orderBy: {
        begin_date: 'desc'
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
        beginDate: challenge.begin_date,
        endDate: challenge.end_date,
        maxTeam: challenge.max_team || 1,
        minTeam: challenge.min_team || 1,
        isSubscriptionNeeded: challenge.is_subscription_needed === 1,
        type: challenge.type,
        trainer: null // Temporarily null until we fix user relation
      }
    })

    return NextResponse.json({ challenges: transformedChallenges })
  } catch (error) {
    console.error('Failed to fetch challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}