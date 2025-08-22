import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const prisma = new PrismaClient()

interface OldProduct {
  id: number
  trainer_id?: number
  name: string
  description?: string
  type?: string
  price: number | string
  discounted_price?: number | string
  currency?: string
  max_use_count?: number
  expires_in_days?: number
  contract_length_in_months?: number
  program_id?: number
  trainer_ticket_category_id?: number
  created_at?: string
  updated_at?: string
}

interface OldOrder {
  id: number
  user_id?: number
  trainer_id?: number
  product_id?: number
  status?: string
  max_use_count?: number
  use_count?: number
  promocode_id?: number
  amount: number | string
  currency?: string
  name?: string
  description?: string
  type?: string
  expired_at?: string
  cancel_allowed_from?: string
  created_at?: string
  updated_at?: string
}

interface OldPayment {
  id: number
  order_id?: number
  user_id?: number
  trainer_id?: number
  currency?: string
  amount: number | string
  gateway?: string
  transaction_id?: string
  status?: string
  reference?: string
  receipt_url?: string
  gateway_response?: string
  created_at?: string
  updated_at?: string
}

async function parseJsonFromSql(filePath: string): Promise<any[]> {
  console.log(`📖 Reading file: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    return []
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const results: any[] = []
  
  // Split by INSERT INTO statements
  const insertStatements = fileContent.split(/INSERT INTO/i).filter(s => s.trim())
  
  for (const statement of insertStatements) {
    // Skip if not a valid statement
    if (!statement.includes('VALUES')) continue
    
    // Extract table name
    const tableMatch = statement.match(/^[^`]*`([^`]+)`/)
    if (!tableMatch) continue
    const tableName = tableMatch[1]
    
    // Extract column names
    const columnsMatch = statement.match(/\(([^)]+)\)\s+VALUES/i)
    if (!columnsMatch) continue
    const columns = columnsMatch[1].split(',').map(c => c.trim().replace(/`/g, ''))
    
    // Extract values - handle multi-line VALUES
    const valuesMatch = statement.match(/VALUES\s+([\s\S]+?)(?:;|$)/i)
    if (!valuesMatch) continue
    
    const valuesStr = valuesMatch[1]
    
    // Parse individual value groups
    let depth = 0
    let currentValue = ''
    let inString = false
    let escapeNext = false
    const valueGroups: string[] = []
    
    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i]
      
      if (escapeNext) {
        currentValue += char
        escapeNext = false
        continue
      }
      
      if (char === '\\') {
        escapeNext = true
        currentValue += char
        continue
      }
      
      if (char === "'" && !inString) {
        inString = true
        currentValue += char
      } else if (char === "'" && inString) {
        inString = false
        currentValue += char
      } else if (char === '(' && !inString) {
        depth++
        if (depth === 1) {
          currentValue = '' // Start new value group
        } else {
          currentValue += char
        }
      } else if (char === ')' && !inString) {
        depth--
        if (depth === 0) {
          valueGroups.push(currentValue)
          currentValue = ''
        } else {
          currentValue += char
        }
      } else {
        currentValue += char
      }
    }
    
    // Process each value group
    for (const valueGroup of valueGroups) {
      if (!valueGroup.trim()) continue
      
      // Parse individual values
      const values: any[] = []
      let currentVal = ''
      let inStr = false
      let escNext = false
      
      for (let i = 0; i < valueGroup.length; i++) {
        const char = valueGroup[i]
        
        if (escNext) {
          currentVal += char
          escNext = false
          continue
        }
        
        if (char === '\\') {
          escNext = true
          continue
        }
        
        if (char === "'" && !inStr) {
          inStr = true
        } else if (char === "'" && inStr) {
          inStr = false
        } else if (char === ',' && !inStr) {
          // End of value
          const val = currentVal.trim()
          if (val === 'NULL') {
            values.push(null)
          } else if (val.startsWith("'") && val.endsWith("'")) {
            values.push(val.slice(1, -1))
          } else {
            const num = parseFloat(val)
            values.push(isNaN(num) ? val : num)
          }
          currentVal = ''
        } else {
          currentVal += char
        }
      }
      
      // Don't forget the last value
      if (currentVal.trim()) {
        const val = currentVal.trim()
        if (val === 'NULL') {
          values.push(null)
        } else if (val.startsWith("'") && val.endsWith("'")) {
          values.push(val.slice(1, -1))
        } else {
          const num = parseFloat(val)
          values.push(isNaN(num) ? val : num)
        }
      }
      
      // Create object from columns and values
      const obj: any = { tableName }
      columns.forEach((col, idx) => {
        obj[col] = values[idx] !== undefined ? values[idx] : null
      })
      
      results.push(obj)
    }
  }
  
  console.log(`✅ Parsed ${results.length} records`)
  return results
}

async function importProducts(data: any[]) {
  console.log('\n📦 Importing Products...')
  
  const products = data.filter(item => 
    item.tableName === 'products' || 
    item.tableName === 'product'
  )
  
  let imported = 0
  let skipped = 0
  
  for (const product of products) {
    try {
      // Check if product already exists by name
      const existing = await prisma.product.findFirst({
        where: { name: String(product.name) }
      })
      
      if (existing) {
        skipped++
        continue
      }
      
      // Determine category from type
      let category = product.type || null
      if (category === 'program') category = 'Programmid'
      else if (category === 'ticket') category = 'Piletid'
      else if (category === 'subscription') category = 'Tellimused'
      
      // Use discounted price if available, otherwise regular price
      const finalPrice = product.discounted_price ? 
        parseFloat(product.discounted_price.toString()) : 
        parseFloat(product.price.toString())
      
      await prisma.product.create({
        data: {
          name: String(product.name || 'Unknown Product'),
          description: product.description ? String(product.description) : null,
          price: finalPrice || 0,
          sku: `FITQ-${product.id}`, // Generate SKU from ID
          stockQuantity: product.max_use_count ? parseInt(product.max_use_count.toString()) : null,
          category: category,
          imageUrl: null, // No image URLs in old data
          isActive: true, // Assume all imported products are active
          createdAt: product.created_at ? 
            (typeof product.created_at === 'string' ? new Date(product.created_at) : new Date(parseInt(product.created_at.toString()) * 1000)) : 
            new Date(),
          updatedAt: product.updated_at ? 
            (typeof product.updated_at === 'string' ? new Date(product.updated_at) : new Date(parseInt(product.updated_at.toString()) * 1000)) : 
            new Date()
        }
      })
      
      imported++
      if (imported % 100 === 0) {
        console.log(`  Progress: ${imported} products imported`)
      }
    } catch (error) {
      console.error(`  ⚠️ Error importing product ${product.name}:`, error.message)
    }
  }
  
  console.log(`✅ Products: ${imported} imported, ${skipped} skipped`)
}

async function importOrders(data: any[]) {
  console.log('\n📋 Importing Orders...')
  
  const orders = data.filter(item => 
    item.tableName === 'orders' || 
    item.tableName === 'order'
  )
  
  let imported = 0
  let skipped = 0
  
  for (const order of orders) {
    try {
      const orderNumber = `ORDER-${order.id}`
      
      // Check if order already exists
      const existing = await prisma.order.findUnique({
        where: { orderNumber }
      })
      
      if (existing) {
        skipped++
        continue
      }
      
      // Get user email if user exists
      let customerEmail = 'unknown@example.com'
      let customerName = 'Unknown Customer'
      
      if (order.user_id) {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(order.user_id) },
          select: { email: true, name: true }
        })
        if (user) {
          customerEmail = user.email
          customerName = user.name || customerEmail.split('@')[0]
        }
      }
      
      await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          userId: order.user_id ? parseInt(order.user_id.toString()) : null,
          customerEmail: customerEmail,
          customerName: order.name ? String(order.name) : customerName,
          customerPhone: null,
          shippingAddress: null,
          billingAddress: null,
          status: String(order.status || 'completed'), // Most old orders are completed
          totalAmount: parseFloat(order.amount?.toString() || '0'),
          currency: String(order.currency || 'EUR'),
          notes: order.description ? String(order.description) : null,
          createdAt: order.created_at ? 
            (typeof order.created_at === 'string' ? new Date(order.created_at) : new Date(parseInt(order.created_at.toString()) * 1000)) : 
            new Date(),
          updatedAt: order.updated_at ? 
            (typeof order.updated_at === 'string' ? new Date(order.updated_at) : new Date(parseInt(order.updated_at.toString()) * 1000)) : 
            new Date()
        }
      })
      
      imported++
      if (imported % 100 === 0) {
        console.log(`  Progress: ${imported} orders imported`)
      }
    } catch (error) {
      console.error(`  ⚠️ Error importing order ${order.id}:`, error.message)
    }
  }
  
  console.log(`✅ Orders: ${imported} imported, ${skipped} skipped`)
}

async function importPayments(data: any[]) {
  console.log('\n💳 Importing Payments...')
  
  const payments = data.filter(item => 
    item.tableName === 'payments' || 
    item.tableName === 'payment'
  )
  
  let imported = 0
  let skipped = 0
  
  for (const payment of payments) {
    try {
      // Check if payment already exists
      if (payment.transaction_id) {
        const existing = await prisma.payment.findUnique({
          where: { transactionId: payment.transaction_id }
        })
        
        if (existing) {
          skipped++
          continue
        }
      }
      
      // Find the order if order_id is provided
      let orderId = null
      if (payment.order_id) {
        const order = await prisma.order.findFirst({
          where: { 
            orderNumber: `ORDER-${payment.order_id}`
          }
        })
        orderId = order?.id || null
      }
      
      // Determine payment method from gateway
      let paymentMethod = 'unknown'
      if (payment.gateway === 'stripe') paymentMethod = 'card'
      else if (payment.gateway === 'swedbank') paymentMethod = 'bank_transfer'
      else if (payment.gateway === 'montonio') paymentMethod = 'bank_transfer'
      else if (payment.gateway) paymentMethod = payment.gateway
      
      await prisma.payment.create({
        data: {
          orderId: orderId,
          userId: payment.user_id ? parseInt(payment.user_id.toString()) : null,
          paymentMethod: paymentMethod,
          transactionId: payment.transaction_id ? String(payment.transaction_id) : payment.reference ? String(payment.reference) : null,
          amount: parseFloat(payment.amount?.toString() || '0'),
          currency: String(payment.currency || 'EUR'),
          status: String(payment.status || 'completed'),
          gatewayResponse: payment.gateway_response ? String(payment.gateway_response) : null,
          paidAt: payment.created_at ? 
            (typeof payment.created_at === 'string' ? new Date(payment.created_at) : new Date(parseInt(payment.created_at.toString()) * 1000)) : 
            null,
          createdAt: payment.created_at ? 
            (typeof payment.created_at === 'string' ? new Date(payment.created_at) : new Date(parseInt(payment.created_at.toString()) * 1000)) : 
            new Date(),
          updatedAt: payment.updated_at ? 
            (typeof payment.updated_at === 'string' ? new Date(payment.updated_at) : new Date(parseInt(payment.updated_at.toString()) * 1000)) : 
            new Date()
        }
      })
      
      imported++
      if (imported % 100 === 0) {
        console.log(`  Progress: ${imported} payments imported`)
      }
    } catch (error) {
      console.error(`  ⚠️ Error importing payment ${payment.id}:`, error.message)
    }
  }
  
  console.log(`✅ Payments: ${imported} imported, ${skipped} skipped`)
}

async function main() {
  console.log('🚀 Starting data import from SQL dump...\n')
  
  // Get SQL file path from command line argument
  const sqlFilePath = process.argv[2]
  
  if (!sqlFilePath) {
    console.error('❌ Please provide the path to your SQL dump file')
    console.error('Usage: npx tsx scripts/import-old-data.ts /path/to/dump.sql')
    process.exit(1)
  }
  
  try {
    // Parse SQL dump
    const data = await parseJsonFromSql(sqlFilePath)
    
    if (data.length === 0) {
      console.error('❌ No data found in the SQL file')
      process.exit(1)
    }
    
    console.log(`📊 Found ${data.length} total records to import`)
    
    // Import data in order (respecting foreign key constraints)
    await importProducts(data)
    await importOrders(data)
    await importPayments(data)
    
    console.log('\n✅ Import completed successfully!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)