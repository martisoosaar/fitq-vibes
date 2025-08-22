import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Follow or unfollow a user
export async function POST(request: NextRequest) {
  try {
    const { followingId, action } = await request.json()
    
    // For now, use hardcoded user ID 73 (Marti)
    const followerId = 73
    
    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 })
    }
    
    if (action === 'follow') {
      // Check if user being followed is a trainer
      const targetUser = await prisma.trainer.findUnique({
        where: { id: followingId }
      })
      
      const isTrainer = !!targetUser
      
      // Check if already following
      const existingFollow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      })
      
      if (existingFollow) {
        // Update status if needed
        if (existingFollow.status !== 'active') {
          await prisma.userFollow.update({
            where: { id: existingFollow.id },
            data: { status: 'active' }
          })
        }
        return NextResponse.json({ 
          success: true, 
          status: existingFollow.status,
          message: 'Already following' 
        })
      }
      
      // Create new follow
      const follow = await prisma.userFollow.create({
        data: {
          followerId,
          followingId,
          status: isTrainer ? 'active' : 'pending'
        }
      })
      
      // Create notification
      if (isTrainer) {
        // Notify trainer of new follower
        await prisma.userNotification.create({
          data: {
            userId: followingId,
            type: 'new_follower',
            title: 'Uus jälgija',
            message: 'Keegi hakkas sind jälgima',
            data: { followerId }
          }
        })
      } else {
        // Notify regular user of follow request
        await prisma.userNotification.create({
          data: {
            userId: followingId,
            type: 'follow_request',
            title: 'Jälgimistaotlus',
            message: 'Keegi soovib sind jälgida',
            data: { followerId }
          }
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        status: follow.status,
        message: isTrainer ? 'Jälgimine alustatud' : 'Jälgimistaotlus saadetud'
      })
      
    } else if (action === 'unfollow') {
      // Delete follow relationship
      await prisma.userFollow.deleteMany({
        where: {
          followerId,
          followingId
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Jälgimine lõpetatud' 
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Follow action failed:', error)
    return NextResponse.json({ error: 'Follow action failed' }, { status: 500 })
  }
}

// Get follow status and counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get('userId') || '0')
    const checkFollowing = parseInt(searchParams.get('checkFollowing') || '0')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    // Get follower and following counts
    const [followersCount, followingCount] = await Promise.all([
      prisma.userFollow.count({
        where: { 
          followingId: userId,
          status: 'active'
        }
      }),
      prisma.userFollow.count({
        where: { 
          followerId: userId,
          status: 'active'
        }
      })
    ])
    
    let isFollowing = false
    let followStatus = null
    
    // Check if current user (Marti) is following this user
    if (checkFollowing) {
      const follow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: 73, // Marti's ID
            followingId: userId
          }
        }
      })
      
      isFollowing = !!follow
      followStatus = follow?.status || null
    }
    
    return NextResponse.json({
      followersCount,
      followingCount,
      isFollowing,
      followStatus
    })
    
  } catch (error) {
    console.error('Failed to get follow info:', error)
    return NextResponse.json({ error: 'Failed to get follow info' }, { status: 500 })
  }
}