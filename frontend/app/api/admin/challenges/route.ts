import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
        beginDate: true,
        endDate: true,
        challengeVisible: true,
        isSubscriptionNeeded: true,
        maxTeam: true,
        minTeam: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        beginDate: 'desc'
      },
      take: 500
    })

    return NextResponse.json(challenges)
  } catch (error) {
    console.error('Failed to fetch challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}