import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'info@fitq.me'

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

    const body = await request.json()
    const { context, value, amount, email, purchaseReferenceId, locale = 'et' } = body

    if (!context || !value || !amount || !email || !purchaseReferenceId) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Verify the purchase reference ID exists in database
    // 2. Check that it belongs to the current user
    // 3. Send the actual gift card via email

    // For demo purposes, we'll simulate sending an email
    if (SENDGRID_API_KEY) {
      const emailContent = locale === 'et' 
        ? {
            subject: 'Teie FitQ kinkekaart',
            text: `Tere!\n\nTeile on saadetud FitQ kinkekaart väärtuses ${amount}€.\n\nKinkekaardi kood: FITQ-XXXX-XXXX-XXXX\n\nKasutamiseks logige sisse FitQ platvormile ja sisestage kood maksmisel.\n\nTervitustega,\nFitQ meeskond`,
            html: `
              <h2>Tere!</h2>
              <p>Teile on saadetud FitQ kinkekaart väärtuses <strong>${amount}€</strong>.</p>
              <p>Kinkekaardi kood: <strong>FITQ-XXXX-XXXX-XXXX</strong></p>
              <p>Kasutamiseks logige sisse FitQ platvormile ja sisestage kood maksmisel.</p>
              <p>Tervitustega,<br>FitQ meeskond</p>
            `
          }
        : {
            subject: 'Your FitQ Gift Card',
            text: `Hello!\n\nYou have received a FitQ gift card worth ${amount}€.\n\nGift card code: FITQ-XXXX-XXXX-XXXX\n\nTo use it, log in to the FitQ platform and enter the code during payment.\n\nBest regards,\nFitQ Team`,
            html: `
              <h2>Hello!</h2>
              <p>You have received a FitQ gift card worth <strong>${amount}€</strong>.</p>
              <p>Gift card code: <strong>FITQ-XXXX-XXXX-XXXX</strong></p>
              <p>To use it, log in to the FitQ platform and enter the code during payment.</p>
              <p>Best regards,<br>FitQ Team</p>
            `
          }

      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email }],
              },
            ],
            from: { email: FROM_EMAIL },
            subject: emailContent.subject,
            content: [
              {
                type: 'text/plain',
                value: emailContent.text,
              },
              {
                type: 'text/html',
                value: emailContent.html,
              },
            ],
          }),
        })

        if (!response.ok) {
          console.error('SendGrid error:', await response.text())
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: locale === 'et' 
        ? 'Kinkekaart on saadetud!' 
        : 'Gift card has been sent!',
      code: 'FITQ-XXXX-XXXX-XXXX', // In real app, get from database
    })
  } catch (error) {
    console.error('Stebby send gift error:', error)
    return NextResponse.json(
      { success: false, message: 'Network error' },
      { status: 500 }
    )
  }
}