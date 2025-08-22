import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const videoId = parseInt(id)
    const body = await request.json()
    
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    const updateData: any = {}
    
    if (body.hidden !== undefined) {
      updateData.hidden = body.hidden
    }
    
    if (body.openForFree !== undefined) {
      updateData.openForFree = body.openForFree
    }
    
    if (body.openForSubscribers !== undefined) {
      updateData.openForSubscribers = body.openForSubscribers
    }
    
    const video = await prisma.video.update({
      where: { id: videoId },
      data: updateData
    })
    
    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error('Failed to update video:', error)
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const videoId = parseInt(id)
    
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    // Soft delete - just mark as deleted
    await prisma.video.update({
      where: { id: videoId },
      data: { videoDeleted: true }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}