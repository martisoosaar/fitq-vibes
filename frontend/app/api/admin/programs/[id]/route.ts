import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const programId = BigInt(id)
    const body = await request.json()
    
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    const updateData: any = {}
    
    if (body.status !== undefined) {
      updateData.status = body.status
    }
    
    if (body.commentsEnabled !== undefined) {
      updateData.commentsEnabled = body.commentsEnabled
    }
    
    if (body.feedbackEnabled !== undefined) {
      updateData.feedbackEnabled = body.feedbackEnabled
    }
    
    const program = await prisma.trainerProgram.update({
      where: { id: programId },
      data: updateData
    })
    
    return NextResponse.json({ 
      success: true, 
      program: {
        ...program,
        id: Number(program.id)
      }
    })
  } catch (error) {
    console.error('Failed to update program:', error)
    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const programId = BigInt(id)
    
    // Check if user is admin (hardcoded for now)
    // In production, you should verify the user's session/token
    
    // Soft delete by setting deletedAt
    await prisma.trainerProgram.update({
      where: { id: programId },
      data: { deletedAt: new Date() }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete program:', error)
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 })
  }
}