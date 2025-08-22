import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateRefreshToken } from '@/lib/repo/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Check for impersonation cookie first, then regular cookie
    const impersonateCookie = cookieStore.get('fitq_impersonate')
    const refreshCookie = impersonateCookie || cookieStore.get('fitq_refresh')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Validate the refresh token and get user
    const tokenData = await validateRefreshToken(refreshCookie.value)
    
    if (!tokenData || !tokenData.user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const user = tokenData.user

    // Debug log
    console.log('User data from token:', {
      id: user.id,
      email: user.email,
      trainerUnlocked: user.trainerUnlocked,
      trainerUnlockedType: typeof user.trainerUnlocked
    })

    // Format avatar URL
    let avatarUrl = null
    if (user.externalAvatar) {
      avatarUrl = user.externalAvatar
    } else if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        avatarUrl = user.avatar
      } else if (user.avatar.startsWith('/')) {
        avatarUrl = user.avatar
      } else {
        // For old paths like "users/September2020/..." or "users/user_9775/...", use CDN
        avatarUrl = `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${user.avatar}`
      }
    }

    // Get trainer slug if user is a trainer
    let trainerSlug = user.simpleLink || user.slug
    if (user.trainerUnlocked) {
      const trainer = await prisma.trainer.findFirst({
        where: {
          OR: [
            { name: user.name },
            { slug: user.simpleLink || '' }
          ]
        },
        select: { slug: true }
      })
      if (trainer) {
        trainerSlug = trainer.slug
      }
    }

    // Return user data with correct field names
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      avatar: avatarUrl,
      trainer_unlocked: user.trainerUnlocked === 1 || user.trainerUnlocked === true || false,
      slug: trainerSlug,
      isAdmin: user.isAdmin || false
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}