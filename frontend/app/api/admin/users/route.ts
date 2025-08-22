import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500) // Max 500 per page
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }
    
    // Get total count for pagination
    const totalCount = await prisma.users.count({ where })
    
    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        is_admin: true,
        trainer_unlocked: true,
        created_at: true,
        total_video_views: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    })

    // Transform to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: Number(user.id),
      email: user.email,
      name: user.name,
      isAdmin: Boolean(user.is_admin),
      trainerUnlocked: user.trainer_unlocked === 1,
      createdAt: user.created_at,
      lastLogin: null, // Not available in legacy schema
      totalVideoViews: user.total_video_views || 0,
      deletedAt: null, // Not available in legacy schema
      isDeleted: false
    }))

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}