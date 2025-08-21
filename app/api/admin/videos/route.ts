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
      videoDeleted: false
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { trainer: { name: { contains: search } } },
        { category: { name: { contains: search } } },
        { 
          trainers: {
            some: {
              trainer: { name: { contains: search } }
            }
          }
        }
      ]
    }
    
    const queryOptions: any = {
      where,
      select: {
        id: true,
        title: true,
        duration: true,
        views: true,
        openForFree: true,
        openForSubscribers: true,
        hidden: true,
        createdAt: true,
        trainer: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }
    
    // Limit results for performance
    queryOptions.take = 500
    
    const videos = await prisma.video.findMany(queryOptions)

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Failed to fetch videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}