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

    // Validate the refresh token
    const tokenData = await validateRefreshToken(refreshCookie.value)
    
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Load user from legacy users table by ID
    const user = await prisma.users.findUnique({ where: { id: Number((tokenData as any).userId || (tokenData as any).user_id || 0) } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Debug log
    console.log('User data from token:', {
      id: (user as any).id,
      email: (user as any).email,
      trainerUnlocked: (user as any).trainer_unlocked,
      trainerUnlockedType: typeof (user as any).trainer_unlocked
    })

    // Format avatar URL
    let avatarUrl = null
    if ((user as any).external_avatar) {
      avatarUrl = (user as any).external_avatar
    } else if ((user as any).avatar) {
      const uav = (user as any).avatar as string
      if (uav.startsWith('http')) {
        avatarUrl = uav
      } else if (uav.startsWith('/')) {
        avatarUrl = uav
      } else {
        // For old paths like "users/user_73/...", use local files
        if (uav.includes('user_')) {
          avatarUrl = `/${uav}`
        } else {
          // Fallback to CDN for other paths
          avatarUrl = `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${uav}`
        }
      }
    }

    // Get trainer slug from user's simpleLink in legacy users table
    let trainerSlug = (user as any).simple_link || (user as any).slug || ''

    // Return user data with correct field names
    return NextResponse.json({
      id: Number((user as any).id),
      email: (user as any).email,
      name: ((user as any).name as string) || ((user as any).email as string).split('@')[0],
      avatar: avatarUrl,
      trainer_unlocked: (user as any).trainer_unlocked === 1 || (user as any).trainer_unlocked === true || false,
      slug: trainerSlug,
      isAdmin: Boolean((user as any).is_admin)
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}