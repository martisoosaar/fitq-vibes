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
        { slug: { contains: search } }
      ]
    }
    
    // Get original trainers from trainers table
    const trainers = await prisma.trainer.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        videosCount: true,
        videoViews: true,
        createdAt: true
      },
      orderBy: {
        videoViews: 'desc'
      }
    })

    return NextResponse.json(trainers)
  } catch (error) {
    console.error('Failed to fetch trainers:', error)
    return NextResponse.json({ error: 'Failed to fetch trainers' }, { status: 500 })
  }
}