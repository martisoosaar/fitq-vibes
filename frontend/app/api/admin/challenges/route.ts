import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { path: { contains: search } }
      ]
    }
    
    const challenges = await prisma.challenge.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        path: true,
        begin_date: true,
        end_date: true,
        challenge_visible: true,
        is_subscription_needed: true,
        max_team: true,
        min_team: true,
        user_id: true,
        type: true,
        created_at: true
      },
      orderBy: {
        begin_date: 'desc'
      },
      take: 500
    })

    // Get user info for challenges that have user_id
    const userIds = [...new Set(challenges.map(c => c.user_id).filter(Boolean))]
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    })
    const userMap = new Map(users.map(u => [u.id, u]))
    
    // Format challenges with user info
    const formattedChallenges = challenges.map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      path: challenge.path,
      beginDate: challenge.begin_date,
      endDate: challenge.end_date,
      challengeVisible: Boolean(challenge.challenge_visible),
      isSubscriptionNeeded: Boolean(challenge.is_subscription_needed),
      maxTeam: challenge.max_team,
      minTeam: challenge.min_team,
      type: challenge.type,
      createdAt: challenge.created_at,
      user: challenge.user_id ? userMap.get(challenge.user_id) || null : null
    }))

    return NextResponse.json(formattedChallenges)
  } catch (error) {
    console.error('Failed to fetch challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}