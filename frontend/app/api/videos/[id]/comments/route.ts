import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

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
    const comments = await prisma.video_comments.findMany({
      where: {
        video_id: videoId,
        parent_id: null, // Only top-level comments
        deleted_at: null
      },
      select: {
        id: true,
        video_id: true,
        user_id: true,
        parent_id: true,
        content: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Return simple comments (no user info for now - will add separately)
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      user: {
        id: comment.user_id,
        name: 'User ' + comment.user_id, // Temporary - will load user info separately
        avatar: null
      },
      likes: 0, // Will implement likes later
      isLiked: false,
      replies: [] // Will implement replies later
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