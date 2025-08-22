import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const where: any = {
      trainer_unlocked: true
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { simple_link: { contains: search } }
      ]
    }
    
    // Get trainers from users table
    const trainers = await prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        simple_link: true,
        total_video_views: true,
        created_at: true,
        display_on_trainers_list: true
      },
      orderBy: {
        total_video_views: 'desc'
      },
      take: 500
    })

    // Transform for admin display
    const transformedTrainers = trainers.map(trainer => ({
      id: Number(trainer.id),
      name: trainer.name,
      email: trainer.email,
      slug: trainer.simple_link || trainer.name?.toLowerCase().replace(/\s+/g, '-') || `user-${trainer.id}`,
      videosCount: 0, // Will calculate if needed
      videoViews: trainer.total_video_views || 0,
      createdAt: trainer.created_at,
      displayOnList: Boolean(trainer.display_on_trainers_list)
    }))

    return NextResponse.json(transformedTrainers)
  } catch (error) {
    console.error('Failed to fetch trainers:', error)
    return NextResponse.json({ error: 'Failed to fetch trainers' }, { status: 500 })
  }
}