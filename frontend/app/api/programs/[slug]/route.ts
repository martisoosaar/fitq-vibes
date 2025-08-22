import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // First try to find by urlSlug, then by ID if it's numeric
    let program
    if (/^\d+$/.test(slug)) {
      // If slug is numeric, search by ID
      program = await prisma.trainerProgram.findFirst({
        where: {
          id: BigInt(slug),
          status: 'PUBLIC'
        }
      })
    } else {
      // Search by urlSlug
      program = await prisma.trainerProgram.findFirst({
        where: {
          urlSlug: slug,
          status: 'PUBLIC'
        }
      })
    }

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    // Fetch intro video if exists
    let introVideo = null
    if (program.introVideoId) {
      const video = await prisma.video.findUnique({
        where: { id: program.introVideoId }
      })
      if (video) {
        introVideo = {
          id: video.id,
          vimeoId: video.vimeoId,
          title: video.title,
          duration: video.duration || 0
        }
      }
    }
    
    // Now fetch units with all their tasks and materials
    const programUnits = await prisma.trainerProgramUnit.findMany({
      where: {
        programId: program.id,
        deletedAt: null
      },
      include: {
        videoMaterials: {
          where: {
            deletedAt: null
          },
          include: {
            video: true
          }
        },
        textTasks: {
          where: {
            deletedAt: null
          },
          orderBy: {
            order: 'asc'
          }
        },
        videoTasks: {
          where: {
            deletedAt: null
          },
          include: {
            video: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        files: {
          where: {
            deletedAt: null
          },
          orderBy: {
            order: 'asc'
          }
        },
        workoutTasks: {
          where: {
            deletedAt: null
          },
          orderBy: {
            order: 'asc'
          }
        },
        cardioTasks: {
          where: {
            deletedAt: null
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Fetch trainer info
    let trainer = null
    if (program.trainerId) {
      // First get the trainer from Trainer table
      const trainerData = await prisma.trainer.findUnique({
        where: { id: Number(program.trainerId) },
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true
        }
      })
      
      if (trainerData) {
        // Use the avatar from Trainer table as it's already correctly set
        // (it already contains the local path like /images/avatars/trainer-126.jpg)
        let avatarUrl = trainerData.avatar || '/images/trainers/avatar.png'
        
        trainer = {
          id: trainerData.id,
          slug: trainerData.slug,
          name: trainerData.name || 'Unknown Trainer',
          profilePicture: avatarUrl
        }
      }
    }

    // Transform units with all tasks and materials
    const transformedUnits = programUnits.map(unit => ({
      id: Number(unit.id),
      title: unit.title,
      description: unit.description,
      order: unit.order || 0,
      // Text tasks
      textTasks: unit.textTasks.map(task => ({
        id: Number(task.id),
        title: task.title,
        description: task.description,
        order: task.order || 0
      })),
      // Video tasks (videos to watch as tasks)
      videoTasks: unit.videoTasks.map(task => ({
        id: Number(task.id),
        order: task.order || 0,
        video: {
          id: task.video.id,
          title: task.video.title,
          duration: task.video.duration || 0,
          vimeoId: task.video.vimeoId,
          iframe: task.video.iframe,
          thumbnail: task.video.videoPreview ? (
            task.video.videoPreview.startsWith('http') 
              ? task.video.videoPreview 
              : task.video.videoPreview.startsWith('/images/')
                ? task.video.videoPreview
                : `/images/video-thumbnails/${task.video.videoPreview}`
          ) : null
        }
      })),
      // Video materials (reference videos)
      videoMaterials: unit.videoMaterials.map(material => ({
        id: material.video.id,
        title: material.video.title,
        duration: material.video.duration || 0,
        vimeoId: material.video.vimeoId,
        iframe: material.video.iframe,
        thumbnail: material.video.videoPreview ? (
          material.video.videoPreview.startsWith('http') 
            ? material.video.videoPreview 
            : material.video.videoPreview.startsWith('/images/')
              ? material.video.videoPreview
              : `/images/video-thumbnails/${material.video.videoPreview}`
        ) : null
      })),
      // File attachments
      files: unit.files.map(file => ({
        id: Number(file.id),
        title: file.title,
        file: file.file, // Already contains the correct path (/program-files/...)
        order: file.order || 0
      })),
      // Workout templates
      workoutTasks: unit.workoutTasks.map(task => ({
        id: Number(task.id),
        title: task.title,
        workoutTemplateId: task.workoutTemplateId,
        order: task.order || 0
      })),
      // Cardio templates
      cardioTasks: unit.cardioTasks.map(task => ({
        id: Number(task.id),
        title: task.title,
        cardioTemplateId: task.cardioTemplateId,
        order: task.order || 0
      }))
    }))

    // Transform the data for frontend
    const transformedProgram = {
      id: Number(program.id),
      title: program.title,
      shortDescription: program.shortDescription,
      description: program.description,
      picture: program.picture ? (
        program.picture.startsWith('http') 
          ? program.picture 
          : `https://old.fitq.me/storage/${program.picture}`
      ) : null,
      faq: program.faq,
      unitLength: program.unitLength,
      unitVisibility: program.unitVisibility,
      languageId: program.languageId,
      status: program.status,
      commentsEnabled: program.commentsEnabled,
      feedbackEnabled: program.feedbackEnabled,
      createdAt: program.createdAt,
      introVideo,
      trainer,
      units: transformedUnits
    }

    return NextResponse.json(transformedProgram)
  } catch (error) {
    console.error('Failed to fetch program:', error)
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 })
  }
}

