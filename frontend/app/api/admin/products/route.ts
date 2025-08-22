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
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Load user from database
    const user = await prisma.users.findUnique({ where: { id: Number(tokenData.userId) } })
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const trainerId = searchParams.get('trainerId') || ''
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      deleted_at: null
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (trainerId) {
      where.trainer_id = BigInt(trainerId)
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.products.count({ where })
    ])

    // Get trainer info for each product
    const trainerIds = [...new Set(products.map(p => Number(p.trainer_id)))]
    const trainers = await prisma.users.findMany({
      where: { id: { in: trainerIds } },
      select: { id: true, name: true, email: true }
    })
    const trainerMap = new Map(trainers.map(t => [Number(t.id), t]))
    
    // Get product types for filter
    const allTypes = await prisma.products.findMany({
      select: { type: true },
      where: { deleted_at: null }
    })
    const uniqueTypes = [...new Set(allTypes.map(p => p.type).filter(Boolean))]
    
    // Format products with trainer info
    const formattedProducts = products.map(product => {
      const trainerId = Number(product.trainer_id)
      const trainer = trainerMap.get(trainerId)
      
      return {
        id: Number(product.id),
        trainer_id: trainerId,
        name: String(product.name),
        description: String(product.description),
        type: String(product.type),
        price: Number(product.price),
        discounted_price: product.discounted_price ? Number(product.discounted_price) : null,
        currency: String(product.currency),
        max_use_count: Number(product.max_use_count),
        expires_in_days: Number(product.expires_in_days),
        contract_length_in_months: product.contract_length_in_months ? Number(product.contract_length_in_months) : null,
        program_id: product.program_id ? Number(product.program_id) : null,
        trainer_ticket_category_id: product.trainer_ticket_category_id ? Number(product.trainer_ticket_category_id) : null,
        created_at: product.created_at ? product.created_at.toISOString() : null,
        updated_at: product.updated_at ? product.updated_at.toISOString() : null,
        deleted_at: product.deleted_at ? product.deleted_at.toISOString() : null,
        trainer: trainer ? {
          id: Number(trainer.id),
          name: String(trainer.name || ''),
          email: String(trainer.email || '')
        } : null
      }
    })

    return NextResponse.json({
      products: formattedProducts,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
      types: uniqueTypes
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
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Load user from database
    const user = await prisma.users.findUnique({ where: { id: Number(tokenData.userId) } })
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.trainer_id || !body.name || !body.type || !body.price || !body.currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create product
    const product = await prisma.products.create({
      data: {
        trainer_id: BigInt(body.trainer_id),
        name: body.name,
        description: body.description || '',
        type: body.type,
        price: body.price,
        discounted_price: body.discounted_price || null,
        currency: body.currency,
        max_use_count: body.max_use_count || 1,
        expires_in_days: body.expires_in_days || 0,
        contract_length_in_months: body.contract_length_in_months || null,
        program_id: body.program_id ? BigInt(body.program_id) : null,
        trainer_ticket_category_id: body.trainer_ticket_category_id || null,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        id: Number(product.id),
        trainer_id: Number(product.trainer_id),
        program_id: product.program_id ? Number(product.program_id) : null,
        price: Number(product.price),
        discounted_price: product.discounted_price ? Number(product.discounted_price) : null
      }
    })
    
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}