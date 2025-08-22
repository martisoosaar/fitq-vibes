import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET /api/videos/[id]/comments - Get video comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const videoId = parseInt(id)
    
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    // Get current user if authenticated
    const authHeader = request.headers.get('authorization')
    let currentUserId = null
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
        currentUserId = decoded.userId
      } catch {
        // User not authenticated, that's okay
      }
    }

    // Get comments with replies and likes
    const comments = await prisma.videoComment.findMany({
      where: {
        videoId,
        parentId: null, // Only top-level comments
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        likes: true,
        replies: {
          where: {
            deletedAt: null
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            likes: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format comments with like counts and user like status
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name || 'Unknown',
        avatar: comment.user.avatar
      },
      likes: comment.likes.length,
      isLiked: currentUserId ? comment.likes.some(like => like.userId === currentUserId) : false,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        user: {
          id: reply.user.id,
          name: reply.user.name || 'Unknown',
          avatar: reply.user.avatar
        },
        likes: reply.likes.length,
        isLiked: currentUserId ? reply.likes.some(like => like.userId === currentUserId) : false
      }))
    }))

    return NextResponse.json({
      comments: formattedComments,
      total: formattedComments.length
    })
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/videos/[id]/comments - Add a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let userId: number
    try {
      const token = authHeader.replace('Bearer ', '')
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userId = decoded.userId
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { id } = await params
    const videoId = parseInt(id)
    
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { content, parentId } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Create comment
    const comment = await prisma.videoComment.create({
      data: {
        videoId,
        userId,
        parentId: parentId || null,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        likes: true
      }
    })

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name || 'Unknown',
        avatar: comment.user.avatar
      },
      likes: 0,
      isLiked: false,
      replies: []
    })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}