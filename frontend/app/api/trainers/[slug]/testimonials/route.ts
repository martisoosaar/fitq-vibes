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
    let trainer = await prisma.users.findFirst({
      where: { simple_link: slug }
    })
    
    if (!trainer) {
      // Try by slugified name
      const users = await prisma.users.findMany({
        where: { name: { not: null } },
        select: { id: true, name: true, simple_link: true }
      })
      
      trainer = users.find(u => 
        u.name && u.name.toLowerCase().replace(/\s+/g, '-') === slug
      )
    }
    
    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }
    
    // Get testimonials for this trainer
    const testimonials = await prisma.trainer_testimonials.findMany({
      where: { trainer_id: BigInt(trainer.id) },
      orderBy: { created_at: 'desc' }
    })
    
    // Get user info for testimonials
    const userIds = testimonials.map(t => Number(t.user_id))
    console.log('Looking for user IDs:', userIds)
    
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true, external_avatar: true }
    })
    console.log('Found users:', users.length)
    
    const userMap = new Map(users.map(u => [Number(u.id), u]))
    
    // Format testimonials
    const formattedTestimonials = testimonials.map(t => {
      const user = userMap.get(Number(t.user_id))
      let avatarUrl = '/images/default-avatar.png'
      
      if (user) {
        if (user.external_avatar) {
          avatarUrl = user.external_avatar
        } else if (user.avatar) {
          if (user.avatar.startsWith('http') || user.avatar.startsWith('/')) {
            avatarUrl = user.avatar
          } else {
            avatarUrl = `/${user.avatar}`
          }
        }
      }
      
      return {
        id: Number(t.id),
        rating: t.rating,
        comment: t.comment,
        createdAt: t.created_at,
        user: user ? {
          id: Number(user.id),
          name: user.name || 'Anonüümne',
          avatar: avatarUrl
        } : null
      }
    })
    
    // Calculate average rating
    const averageRating = testimonials.length > 0 
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : 0
    
    return NextResponse.json({
      testimonials: formattedTestimonials,
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
    // Check authentication
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const tokenData = await validateRefreshToken(refreshCookie.value)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const userId = Number(tokenData.userId)
    const { slug } = await params
    
    // Find trainer by slug
    let trainer = await prisma.users.findFirst({
      where: { simple_link: slug }
    })
    
    if (!trainer) {
      // Try by slugified name
      const users = await prisma.users.findMany({
        where: { name: { not: null } },
        select: { id: true, name: true, simple_link: true }
      })
      
      trainer = users.find(u => 
        u.name && u.name.toLowerCase().replace(/\s+/g, '-') === slug
      )
    }
    
    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }
    
    const body = await request.json()
    const { rating, comment } = body
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }
    
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Comment must be at least 10 characters' }, { status: 400 })
    }
    
    // Check if user already has testimonial for this trainer
    const existing = await prisma.trainer_testimonials.findFirst({
      where: {
        trainer_id: BigInt(trainer.id),
        user_id: BigInt(userId)
      }
    })
    
    if (existing) {
      // Update existing testimonial
      await prisma.trainer_testimonials.update({
        where: { id: existing.id },
        data: {
          rating: rating,
          comment: comment.trim(),
          updated_at: new Date()
        }
      })
      
      return NextResponse.json({ message: 'Arvustus edukalt uuendatud!' })
    } else {
      // Create new testimonial
      await prisma.trainer_testimonials.create({
        data: {
          trainer_id: BigInt(trainer.id),
          user_id: BigInt(userId),
          rating: rating,
          comment: comment.trim(),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
      
      return NextResponse.json({ message: 'Arvustus edukalt lisatud!' })
    }
  } catch (error) {
    console.error('Failed to create testimonial:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
