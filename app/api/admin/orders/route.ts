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
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerEmail: { contains: search } },
        { customerName: { contains: search } }
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    // Get orders with user and payment info
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          trainer: {
            select: {
              id: true,
              name: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              trainer: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentMethod: true,
              paidAt: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ])

    // Get unique statuses for filter
    const statuses = await prisma.order.findMany({
      select: { status: true },
      distinct: ['status']
    })

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      statuses: statuses.map(s => s.status).filter(Boolean)
    })
    
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}