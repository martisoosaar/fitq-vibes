import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const where: any = {
      deletedAt: null
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
        { urlSlug: { contains: search } },
        { trainer: { name: { contains: search } } }
      ]
    }
    
    const programs = await prisma.trainerProgram.findMany({
      where,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        picture: true,
        urlSlug: true,
        status: true,
        unitLength: true,
        languageId: true,
        commentsEnabled: true,
        feedbackEnabled: true,
        createdAt: true,
        trainer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 500
    })

    // Transform BigInt to number for JSON serialization
    const transformedPrograms = programs.map(program => ({
      ...program,
      id: Number(program.id)
    }))

    return NextResponse.json(transformedPrograms)
  } catch (error) {
    console.error('Failed to fetch programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}