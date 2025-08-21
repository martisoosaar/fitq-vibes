import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if requesting sessions
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    if (type === 'sessions') {
      // Fetch user's device sessions
      const sessions = await prisma.deviceSession.findMany({
        where: { userId: 73 }, // Marti's ID
        orderBy: { lastUsedAt: 'desc' },
        select: {
          id: true,
          deviceName: true,
          ip: true,
          ua: true,
          lastUsedAt: true,
          createdAt: true
        }
      })
      
      return NextResponse.json(sessions)
    }
    
    // Default: fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: 73 }, // Marti's ID
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        externalAvatar: true,
        profileDesc: true,
        birthday: true,
        sex: true,
        height: true,
        weight: true,
        country: true,
        timezone: true,
        weeklyNews: true,
        monthlyNews: true,
        hideNameFromLeaderboards: true,
        commentEmailNotifications: true,
        programUnitInfoEmailNotifications: true,
        showIntro: true,
        displayOnTrainersList: true,
        userLanguage: true,
        trainerUnlocked: true,
        isAdmin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
        avatarUrl = `/${user.avatar}`
      }
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name || '',
      avatar: avatarUrl,
      profileDesc: user.profileDesc || '',
      birthday: user.birthday?.toISOString() || null,
      sex: user.sex || '',
      height: user.height || null,
      weight: user.weight || null,
      country: user.country || '',
      timezone: user.timezone || '',
      weeklyNews: user.weeklyNews === 1,
      monthlyNews: user.monthlyNews === 1,
      hideNameFromLeaderboards: user.hideNameFromLeaderboards === 1,
      commentEmailNotifications: user.commentEmailNotifications === 1,
      programUnitInfoEmailNotifications: user.programUnitInfoEmailNotifications === 1,
      showIntro: user.showIntro === 1,
      displayOnTrainersList: user.displayOnTrainersList === 1,
      userLanguage: user.userLanguage || 1,
      trainerUnlocked: user.trainerUnlocked === 1,
      isAdmin: user.isAdmin || false
    })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Handle avatar upload
    let avatarPath = null
    const avatarFile = formData.get('avatar') as File
    if (avatarFile && avatarFile.size > 0) {
      const bytes = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create user directory if it doesn't exist
      const userDir = path.join(process.cwd(), 'public', 'users', 'user_73')
      await mkdir(userDir, { recursive: true })
      
      // Save file with timestamp to avoid caching issues
      const timestamp = Date.now()
      const filename = `avatar-${timestamp}.${avatarFile.name.split('.').pop()}`
      const filePath = path.join(userDir, filename)
      await writeFile(filePath, buffer)
      
      avatarPath = `/users/user_73/${filename}`
    }

    // Parse form data
    const updateData: any = {}
    
    // Handle text fields
    const name = formData.get('name') as string
    if (name !== null) updateData.name = name
    
    const sex = formData.get('sex') as string
    if (sex !== null) updateData.sex = sex || null
    
    // Handle boolean fields (they come as strings)
    const weeklyNews = formData.get('weeklyNews') as string
    if (weeklyNews !== null) updateData.weeklyNews = weeklyNews === 'true' ? 1 : 0
    
    const monthlyNews = formData.get('monthlyNews') as string
    if (monthlyNews !== null) updateData.monthlyNews = monthlyNews === 'true' ? 1 : 0
    
    const hideNameFromLeaderboards = formData.get('hideNameFromLeaderboards') as string
    if (hideNameFromLeaderboards !== null) updateData.hideNameFromLeaderboards = hideNameFromLeaderboards === 'true' ? 1 : null
    
    const commentEmailNotifications = formData.get('commentEmailNotifications') as string
    if (commentEmailNotifications !== null) updateData.commentEmailNotifications = commentEmailNotifications === 'true' ? 1 : 0
    
    const programUnitInfoEmailNotifications = formData.get('programUnitInfoEmailNotifications') as string
    if (programUnitInfoEmailNotifications !== null) updateData.programUnitInfoEmailNotifications = programUnitInfoEmailNotifications === 'true' ? 1 : 0
    
    const showIntro = formData.get('showIntro') as string
    if (showIntro !== null) updateData.showIntro = showIntro === 'true' ? 1 : 0
    
    const displayOnTrainersList = formData.get('displayOnTrainersList') as string
    if (displayOnTrainersList !== null) updateData.displayOnTrainersList = displayOnTrainersList === 'true' ? 1 : 0

    // Handle birthday
    const birthday = formData.get('birthday') as string
    if (birthday) {
      updateData.birthday = new Date(birthday)
    }

    // Handle numeric fields
    const height = formData.get('height') as string
    if (height && height !== '') {
      updateData.height = parseInt(height)
    }

    const weight = formData.get('weight') as string
    if (weight && weight !== '') {
      updateData.weight = parseInt(weight)
    }

    // Add avatar if uploaded
    if (avatarPath) {
      updateData.avatar = avatarPath
      updateData.externalAvatar = null
    }

    // Update user (hardcoded for Marti)
    const updatedUser = await prisma.user.update({
      where: { id: 73 },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        externalAvatar: true,
        birthday: true,
        sex: true,
        height: true,
        weight: true
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}