import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateRefreshToken } from '@/lib/repo/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Find trainer by slug
    const trainer = await prisma.trainer.findUnique({
      where: { slug }
    })
    
    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }
    
    // Get approved testimonials for this trainer
    const testimonials = await prisma.trainerTestimonial.findMany({
      where: {
        trainerId: trainer.id,
        isApproved: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            externalAvatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Format testimonials with user avatars
    const formattedTestimonials = testimonials.map(testimonial => {
      let avatarUrl = '/images/avatar.png'
      
      if (testimonial.user.externalAvatar) {
        avatarUrl = testimonial.user.externalAvatar
      } else if (testimonial.user.avatar) {
        if (testimonial.user.avatar.startsWith('http') || testimonial.user.avatar.startsWith('/')) {
          avatarUrl = testimonial.user.avatar
        } else if (testimonial.user.avatar.includes('users/')) {
          avatarUrl = `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${testimonial.user.avatar}`
        }
      }
      
      return {
        id: testimonial.id,
        rating: testimonial.rating,
        comment: testimonial.comment,
        createdAt: testimonial.createdAt.toISOString(),
        user: {
          id: testimonial.user.id,
          name: testimonial.user.name || 'Anonymous',
          avatar: avatarUrl
        }
      }
    })
    
    // Calculate average rating
    const averageRating = testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : 0
    
    return NextResponse.json({
      testimonials: formattedTestimonials,
      totalCount: testimonials.length,
      averageRating: Math.round(averageRating * 10) / 10
    })
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Validate user session
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = await validateRefreshToken(refreshCookie.value)
    
    if (!tokenData || !tokenData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = tokenData.user.id
    
    // Find trainer by slug
    const trainer = await prisma.trainer.findUnique({
      where: { slug }
    })
    
    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }
    
    // Get request body
    const body = await request.json()
    const { rating, comment } = body
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }
    
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Comment must be at least 10 characters' }, { status: 400 })
    }
    
    // Check if user already has a testimonial for this trainer
    const existingTestimonial = await prisma.trainerTestimonial.findFirst({
      where: {
        trainerId: trainer.id,
        userId
      }
    })
    
    if (existingTestimonial) {
      // Update existing testimonial
      const updated = await prisma.trainerTestimonial.update({
        where: { id: existingTestimonial.id },
        data: {
          rating,
          comment: comment.trim(),
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        testimonial: updated,
        message: 'Testimonial updated successfully'
      })
    } else {
      // Create new testimonial
      const testimonial = await prisma.trainerTestimonial.create({
        data: {
          trainerId: trainer.id,
          userId,
          rating,
          comment: comment.trim(),
          isApproved: true // Auto-approve for now
        }
      })
      
      return NextResponse.json({
        success: true,
        testimonial,
        message: 'Testimonial submitted successfully'
      })
    }
  } catch (error) {
    console.error('Failed to submit testimonial:', error)
    return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 })
  }
}