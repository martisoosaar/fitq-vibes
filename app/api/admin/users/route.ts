import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    const totalCount = await prisma.user.count({ where })
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        trainerUnlocked: true,
        createdAt: true,
        lastLogin: true,
        totalVideoViews: true,
        deletedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Transform trainerUnlocked from number to boolean and add isDeleted flag
    const transformedUsers = users.map(user => ({
      ...user,
      trainerUnlocked: user.trainerUnlocked === 1,
      isDeleted: user.deletedAt !== null
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