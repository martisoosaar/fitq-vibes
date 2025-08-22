import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth header' })
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid auth header format', header: authHeader })
    }

    const token = authHeader.slice(7)
    
    // Try to decode without verification first
    const decodedWithoutVerification = jwt.decode(token)
    
    // Try to verify
    let verified = null
    let verifyError = null
    try {
      verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (e: any) {
      verifyError = e.message
    }
    
    // Get user if we have userId
    let user = null
    if (decodedWithoutVerification && typeof decodedWithoutVerification === 'object' && 'userId' in decodedWithoutVerification) {
      user = await prisma.user.findUnique({
        where: { id: (decodedWithoutVerification as any).userId },
        select: {
          id: true,
          email: true,
          name: true,
          birthday: true,
          sex: true,
          height: true,
          weight: true
        }
      })
    }
    
    return NextResponse.json({
      token: token.substring(0, 20) + '...',
      decodedWithoutVerification,
      verified,
      verifyError,
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      user
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}