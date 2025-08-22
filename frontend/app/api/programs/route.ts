import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const programs = await prisma.trainerProgram.findMany({
      where: {
        deleted_at: null,
        // Show all non-deleted programs
        status: {
          in: ['PUBLIC', 'LIMITED_ACCESS', 'PRIVATE']
        }
      },
      select: {
        id: true,
        title: true,
        short_description: true,
        description: true,
        picture: true,
        url_slug: true,
        unit_length: true,
        unit_visibility: true,
        language_id: true,
        status: true,
        comments_enabled: true,
        feedback_enabled: true,
        created_at: true,
        trainer_id: true,
      },
      orderBy: {
        created_at: 'desc'
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

      // Create slug from title if url_slug is not set
      const slug = program.url_slug || program.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      return {
        id: Number(program.id),
        title: program.title,
        shortDescription: program.short_description,
        description: program.description,
        picture: imageUrl,
        slug: slug,
        unitLength: program.unit_length,
        unitVisibility: program.unit_visibility,
        languageId: program.language_id,
        status: program.status,
        commentsEnabled: program.comments_enabled,
        feedbackEnabled: program.feedback_enabled,
        createdAt: program.created_at,
        trainer: null // Temporarily null until we fix trainer relation
      }
    })

    return NextResponse.json({ programs: transformedPrograms })
  } catch (error) {
    console.error('Failed to fetch programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}
