import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { validateRefreshToken } from '@/lib/repo/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const productId = BigInt(id)
    const body = await request.json()

    // Build update data
    const updateData: any = {
      updated_at: new Date()
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.price !== undefined) updateData.price = body.price
    if (body.discounted_price !== undefined) updateData.discounted_price = body.discounted_price
    if (body.currency !== undefined) updateData.currency = body.currency
    if (body.max_use_count !== undefined) updateData.max_use_count = body.max_use_count
    if (body.expires_in_days !== undefined) updateData.expires_in_days = body.expires_in_days
    if (body.contract_length_in_months !== undefined) updateData.contract_length_in_months = body.contract_length_in_months
    if (body.program_id !== undefined) updateData.program_id = body.program_id ? BigInt(body.program_id) : null
    if (body.trainer_ticket_category_id !== undefined) updateData.trainer_ticket_category_id = body.trainer_ticket_category_id

    // Update product
    const product = await prisma.products.update({
      where: { id: productId },
      data: updateData
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
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const productId = BigInt(id)

    // Soft delete product
    await prisma.products.update({
      where: { id: productId },
      data: { 
        deleted_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
