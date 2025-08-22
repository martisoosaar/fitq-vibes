import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const where: any = {
      deleted_at: null
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { short_description: { contains: search } },
        { url_slug: { contains: search } }
      ]
    }
    
    const programs = await prisma.trainerProgram.findMany({
      where,
      select: {
        id: true,
        title: true,
        short_description: true,
        picture: true,
        url_slug: true,
        status: true,
        unit_length: true,
        language_id: true,
        comments_enabled: true,
        feedback_enabled: true,
        created_at: true,
        trainer_id: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 500
    })

    // Get trainer info for programs
    const trainerIds = [...new Set(programs.map(p => p.trainer_id).filter(Boolean))]
    const trainers = await prisma.users.findMany({
      where: { id: { in: trainerIds } },
      select: { id: true, name: true, email: true }
    })
    const trainerMap = new Map(trainers.map(t => [t.id, t]))
    
    // Transform programs with trainer info
    const transformedPrograms = programs.map(program => ({
      id: Number(program.id),
      title: program.title,
      shortDescription: program.short_description,
      picture: program.picture,
      urlSlug: program.url_slug,
      status: program.status,
      unitLength: program.unit_length,
      languageId: program.language_id,
      commentsEnabled: Boolean(program.comments_enabled),
      feedbackEnabled: Boolean(program.feedback_enabled),
      createdAt: program.created_at,
      trainer: trainerMap.get(program.trainer_id) || null
    }))

    return NextResponse.json(transformedPrograms)
  } catch (error) {
    console.error('Failed to fetch programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}