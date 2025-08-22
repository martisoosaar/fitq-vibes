import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { validateRefreshToken } from '@/lib/repo/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get('fitq_refresh') || cookieStore.get('fitq_impersonate')
    
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenData = await validateRefreshToken(refreshCookie.value)
    if (!tokenData || !tokenData.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Check if user is admin
    if (tokenData.user.roleId !== 1 && tokenData.user.email !== 'marti@fitq.studio') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const method = searchParams.get('method') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { transactionId: { contains: search } },
        { order: { orderNumber: { contains: search } } },
        { user: { email: { contains: search } } }
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    if (method) {
      where.paymentMethod = method
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    // Get payments with related data
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              customerEmail: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ])

    // Get unique statuses and methods for filters
    const [statuses, methods] = await Promise.all([
      prisma.payment.findMany({
        select: { status: true },
        distinct: ['status']
      }),
      prisma.payment.findMany({
        select: { paymentMethod: true },
        distinct: ['paymentMethod']
      })
    ])

    return NextResponse.json({
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      statuses: statuses.map(s => s.status).filter(Boolean),
      methods: methods.map(m => m.paymentMethod).filter(Boolean)
    })
    
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}