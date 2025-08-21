import { NextRequest, NextResponse } from 'next/server'

const STEBBY_API_URL = process.env.STEBBY_API_URL || 'https://api.stebby.eu'
const STEBBY_API_KEY = process.env.STEBBY_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { context, value } = body

    if (!context || !value) {
      return NextResponse.json(
        { success: false, message: 'Context and value are required' },
        { status: 400 }
      )
    }

    // Call Stebby API to check balance
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
            price: 400,
            applyDiscount: 1,
            amount: 1,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      
      // Handle specific Stebby error codes
      if (response.status === 400 && errorData?.errors?.[0]?.code === 2103) {
        return NextResponse.json(
          { success: false, message: 'Konto ei leitud Stebby süsteemis' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          message: errorData?.errors?.[0]?.message || 'Failed to check balance' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      available: data.totalAvailable || 0,
      difference: data.totalDifference || 0,
      purchaseReferenceId: data.purchaseReferenceId || null,
    })
  } catch (error) {
    console.error('Stebby balance check error:', error)
    return NextResponse.json(
      { success: false, message: 'Network error' },
      { status: 500 }
    )
  }
}