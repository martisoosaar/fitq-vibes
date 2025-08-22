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
    
    // Check if user is admin (you may want to adjust this based on your role system)
    if (tokenData.user.roleId !== 1 && tokenData.user.email !== 'marti@fitq.studio') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } }
      ]
    }
    
    if (category) {
      where.category = category
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          trainer: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: { orderItems: true }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // Get categories for filter
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } }
    })

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories: categories.map(c => c.category).filter(Boolean)
    })
    
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        sku: body.sku,
        stockQuantity: parseInt(body.stockQuantity) || 0,
        category: body.category,
        imageUrl: body.imageUrl,
        isActive: body.isActive !== false
      }
    })

    return NextResponse.json(product)
    
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}