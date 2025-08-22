import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const challengeId = parseInt(id)
    const body = await request.json()
    
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    const updateData: any = {}
    
    if (body.challengeVisible !== undefined) {
      updateData.challengeVisible = body.challengeVisible
    }
    
    if (body.isSubscriptionNeeded !== undefined) {
      updateData.isSubscriptionNeeded = body.isSubscriptionNeeded
    }
    
    const challenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: updateData
    })
    
    return NextResponse.json({ success: true, challenge })
  } catch (error) {
    console.error('Failed to update challenge:', error)
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const challengeId = parseInt(id)
    
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    await prisma.challenge.delete({
      where: { id: challengeId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete challenge:', error)
    return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 })
  }
}