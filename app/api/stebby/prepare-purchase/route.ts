import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const STEBBY_API_URL = process.env.STEBBY_API_URL || 'https://api.stebby.eu'
const STEBBY_API_KEY = process.env.STEBBY_API_KEY || ''

// Simple gift card code generator
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'FITQ-'
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('fitq_refresh')
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    // Validate token
    const { validateRefreshToken } = await import('@/lib/repo/auth')
    const tokenData = await validateRefreshToken(refreshToken.value)
    
    if (!tokenData || !tokenData.user) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    const user = tokenData.user

    const body = await request.json()
    const { context, value, amount } = body

    if (!context || !value || !amount) {
      return NextResponse.json(
        { success: false, message: 'Context, value, and amount are required' },
        { status: 400 }
      )
    }

    // Call Stebby API to prepare purchase
    const response = await fetch(`${STEBBY_API_URL}/api/v4/purchase/calculate`, {
      method: 'POST',
      headers: {
        'Api-Key': STEBBY_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: {
          context,
          value,
        },
        purchasables: [
          {
            code: 'trainer_ticket',
            name: 'Personaalne treeningpakett',
            price: amount,
            applyDiscount: 1,
            amount: 1,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return NextResponse.json(
        { 
          success: false, 
          message: errorData?.errors?.[0]?.message || 'Failed to prepare purchase' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Generate a gift card code
    const giftCardCode = generateGiftCardCode()

    // In a real application, you would save this to database
    // For now, we'll just return the mock data
    const giftCard = {
      id: Math.random().toString(36).substr(2, 9),
      code: giftCardCode,
      amount: amount,
      status: 'pending',
      userId: user.id,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      gift_card: giftCard,
      purchaseReferenceId: data.purchaseReferenceId || Math.random().toString(36).substr(2, 9),
      total_available: data.totalAvailable || 0,
      total_difference: data.totalDifference || 0,
    })
  } catch (error) {
    console.error('Stebby prepare purchase error:', error)
    return NextResponse.json(
      { success: false, message: 'Network error' },
      { status: 500 }
    )
  }
}