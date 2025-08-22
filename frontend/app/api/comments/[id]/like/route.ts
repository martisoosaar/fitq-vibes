import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// POST /api/comments/[id]/like - Toggle like on a comment
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
    const commentId = parseInt(id)
    
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      )
    }

    // Check if comment exists
    const comment = await prisma.videoComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if already liked
    const existingLike = await prisma.videoCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    })

    if (existingLike) {
      // Remove like
      await prisma.videoCommentLike.delete({
        where: {
          id: existingLike.id
        }
      })

      // Get updated like count
      const likeCount = await prisma.videoCommentLike.count({
        where: { commentId }
      })

      return NextResponse.json({
        liked: false,
        likes: likeCount
      })
    } else {
      // Add like
      await prisma.videoCommentLike.create({
        data: {
          userId,
          commentId
        }
      })

      // Get updated like count
      const likeCount = await prisma.videoCommentLike.count({
        where: { commentId }
      })

      return NextResponse.json({
        liked: true,
        likes: likeCount
      })
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}