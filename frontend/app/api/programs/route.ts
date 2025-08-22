import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const programs = await prisma.trainerProgram.findMany({
      where: {
        status: 'PUBLIC',
        deletedAt: null
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        description: true,
        picture: true,
        urlSlug: true,
        unitLength: true,
        unitVisibility: true,
        languageId: true,
        status: true,
        commentsEnabled: true,
        feedbackEnabled: true,
        createdAt: true,
        trainerId: true,
        trainer: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data for frontend
    const transformedPrograms = programs.map(program => {
      // Fix image URLs
      let imageUrl = program.picture
      if (imageUrl) {
        if (imageUrl.startsWith('https://storage.googleapis.com/')) {
          // Google Cloud Storage URL - keep as is
          imageUrl = imageUrl
        } else if (imageUrl.startsWith('https://old.fitq.me/storage/')) {
          // Old storage URL - keep as is
          imageUrl = imageUrl
        } else if (imageUrl && !imageUrl.startsWith('http')) {
          // Relative path - add full URL prefix
          imageUrl = `https://old.fitq.me/storage/${imageUrl}`
        }
      }

      // Create slug from title if urlSlug is not set
      const slug = program.urlSlug || program.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      return {
        id: Number(program.id),
        title: program.title,
        shortDescription: program.shortDescription,
        description: program.description,
        picture: imageUrl,
        slug: slug,
        unitLength: program.unitLength,
        unitVisibility: program.unitVisibility,
        languageId: program.languageId,
        status: program.status,
        commentsEnabled: program.commentsEnabled,
        feedbackEnabled: program.feedbackEnabled,
        createdAt: program.createdAt,
        trainer: program.trainer ? {
          id: program.trainer.id,
          name: program.trainer.name || 'Treener',
          avatar: program.trainer.avatar?.startsWith('/') 
            ? program.trainer.avatar 
            : `/${program.trainer.avatar || 'users/default.png'}`,
          slug: program.trainer.name?.toLowerCase().replace(/\s+/g, '') || `user-${program.trainer.id}`
        } : null
      }
    })

    return NextResponse.json(transformedPrograms)
  } catch (error) {
    console.error('Failed to fetch programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}
