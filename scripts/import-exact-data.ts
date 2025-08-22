import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

function parseInsertValues(line: string): any[] {
  // Remove parentheses and split by proper delimiters
  const content = line.slice(1, -1) // Remove outer parentheses
  const values: any[] = []
  let current = ''
  let inString = false
  let stringChar = ''
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]
    
    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true
        stringChar = char
        current += char
      } else if (char === ',' && !inString) {
        // End of value
        const trimmed = current.trim()
        if (trimmed === 'NULL') {
          values.push(null)
        } else if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
          // String value - remove quotes
          values.push(trimmed.slice(1, -1))
        } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          // String value - remove quotes
          values.push(trimmed.slice(1, -1))
        } else {
          // Try to parse as number
          const num = parseFloat(trimmed)
          values.push(isNaN(num) ? trimmed : num)
        }
        current = ''
      } else {
        current += char
      }
    } else {
      // We're inside a string
      if (char === '\\' && nextChar === stringChar) {
        // Escaped quote
        current += char + nextChar
        i++ // Skip next char
      } else if (char === stringChar) {
        // End of string
        inString = false
        stringChar = ''
        current += char
      } else {
        current += char
      }
    }
  }
  
  // Don't forget the last value
  if (current) {
    const trimmed = current.trim()
    if (trimmed === 'NULL') {
      values.push(null)
    } else if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      values.push(trimmed.slice(1, -1))
    } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      values.push(trimmed.slice(1, -1))
    } else {
      const num = parseFloat(trimmed)
      values.push(isNaN(num) ? trimmed : num)
    }
  }
  
  return values
}

async function importFromSQL(sqlFilePath: string) {
  console.log('🚀 Starting EXACT data import from SQL dump...\n')
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error('❌ File not found:', sqlFilePath)
    return
  }
  
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')
  const lines = sqlContent.split('\n')
  
  let currentTable = ''
  let columns: string[] = []
  let productsImported = 0
  let ordersImported = 0
  let paymentsImported = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect INSERT INTO statements (they might span multiple lines)
    if (line.startsWith('INSERT INTO `products`')) {
      currentTable = 'products'
      // Extract column names - might be on this line or continued
      let fullLine = line
      let j = i
      while (!fullLine.includes('VALUES') && j < lines.length - 1) {
        j++
        fullLine += ' ' + lines[j].trim()
      }
      const match = fullLine.match(/\((.*?)\) VALUES/)
      if (match) {
        columns = match[1].split(',').map(c => c.trim().replace(/`/g, ''))
      }
      console.log('📦 Processing products table...')
      console.log('  Columns:', columns.length, 'columns found')
      i = j // Skip the lines we've already read
      continue
    }
    
    if (line.startsWith('INSERT INTO `orders`')) {
      currentTable = 'orders'
      let fullLine = line
      let j = i
      while (!fullLine.includes('VALUES') && j < lines.length - 1) {
        j++
        fullLine += ' ' + lines[j].trim()
      }
      const match = fullLine.match(/\((.*?)\) VALUES/)
      if (match) {
        columns = match[1].split(',').map(c => c.trim().replace(/`/g, ''))
      }
      console.log('📋 Processing orders table...')
      console.log('  Columns:', columns.length, 'columns found')
      i = j
      continue
    }
    
    if (line.startsWith('INSERT INTO `payments`')) {
      currentTable = 'payments'
      let fullLine = line
      let j = i
      while (!fullLine.includes('VALUES') && j < lines.length - 1) {
        j++
        fullLine += ' ' + lines[j].trim()
      }
      const match = fullLine.match(/\((.*?)\) VALUES/)
      if (match) {
        columns = match[1].split(',').map(c => c.trim().replace(/`/g, ''))
      }
      console.log('💳 Processing payments table...')
      console.log('  Columns:', columns.length, 'columns found')
      i = j
      continue
    }
    
    // Process data lines
    if (line.startsWith('(') && currentTable) {
      try {
        // Handle the line ending - it might end with ',' or ';'
        let valueLine = line
        if (line.endsWith(',')) {
          valueLine = line.slice(0, -1)
        } else if (line.endsWith(';')) {
          valueLine = line.slice(0, -1)
        }
        
        const values = parseInsertValues(valueLine)
        
        // Map values to object
        const obj: any = {}
        columns.forEach((col, idx) => {
          obj[col] = values[idx]
        })
        
        if (currentTable === 'products') {
          // Skip deleted products
          if (obj.deleted_at) continue
          
          // Log first product to debug
          if (productsImported === 0) {
            console.log('  First product data:', obj)
          }
          
          // Check if trainer exists
          let trainerId = null
          if (obj.trainer_id) {
            const trainer = await prisma.trainer.findUnique({
              where: { id: parseInt(obj.trainer_id) }
            })
            trainerId = trainer?.id || null
          }
          
          await prisma.product.create({
            data: {
              id: parseInt(obj.id), // Use the exact ID from SQL
              trainerId: trainerId,
              name: String(obj.name || 'Unknown Product'),
              description: obj.description ? String(obj.description) : null,
              price: parseFloat(obj.discounted_price || obj.price || '0'),
              sku: `FITQ-${obj.id}`,
              stockQuantity: obj.max_use_count ? parseInt(obj.max_use_count) : null,
              category: obj.type || null,
              isActive: !obj.deleted_at,
              createdAt: obj.created_at ? new Date(obj.created_at) : new Date(),
              updatedAt: obj.updated_at ? new Date(obj.updated_at) : new Date()
            }
          })
          productsImported++
          if (productsImported % 50 === 0) {
            console.log(`  Progress: ${productsImported} products imported`)
          }
        }
        
        if (currentTable === 'orders') {
          // Skip deleted orders
          if (obj.deleted_at) continue
          
          // Log first order to debug
          if (ordersImported === 0) {
            console.log('  First order data:', obj)
          }
          
          // Get customer info
          let customerEmail = 'unknown@example.com'
          let customerName = obj.name || 'Unknown'
          let userId = null
          
          if (obj.user_id) {
            const user = await prisma.user.findUnique({
              where: { id: parseInt(obj.user_id) },
              select: { email: true, name: true }
            })
            if (user) {
              userId = user.id
              customerEmail = user.email
              customerName = user.name || obj.name || customerEmail.split('@')[0]
            } else {
              // User doesn't exist, use order info
              customerEmail = `user${obj.user_id}@example.com`
              customerName = obj.name || `User ${obj.user_id}`
            }
          }
          
          // Check if trainer exists
          let trainerId = null
          if (obj.trainer_id) {
            const trainer = await prisma.trainer.findUnique({
              where: { id: parseInt(obj.trainer_id) }
            })
            trainerId = trainer?.id || null
          }
          
          // Check if product exists
          let productId = null
          if (obj.product_id) {
            const product = await prisma.product.findUnique({
              where: { id: parseInt(obj.product_id) }
            })
            productId = product?.id || null
          }
          
          await prisma.order.create({
            data: {
              id: parseInt(obj.id), // Use exact ID from SQL
              orderNumber: `ORDER-${obj.id}`,
              userId: userId,
              trainerId: trainerId,
              productId: productId,
              customerEmail: customerEmail,
              customerName: customerName,
              status: String(obj.status || 'completed'),
              totalAmount: parseFloat(obj.amount || '0'),
              currency: String(obj.currency || 'EUR'),
              notes: obj.description ? String(obj.description) : null,
              createdAt: obj.created_at ? new Date(obj.created_at) : new Date(),
              updatedAt: obj.updated_at ? new Date(obj.updated_at) : new Date()
            }
          })
          ordersImported++
          if (ordersImported % 500 === 0) {
            console.log(`  Progress: ${ordersImported} orders imported`)
          }
        }
        
        if (currentTable === 'payments') {
          // Skip deleted payments
          if (obj.deleted_at) continue
          
          // Find related order
          let orderId = null
          if (obj.order_id) {
            const order = await prisma.order.findFirst({
              where: { orderNumber: `ORDER-${obj.order_id}` }
            })
            orderId = order?.id || null
          }
          
          await prisma.payment.create({
            data: {
              id: parseInt(obj.id), // Use exact ID from SQL
              orderId: orderId,
              userId: obj.user_id ? parseInt(obj.user_id) : null,
              paymentMethod: obj.gateway || 'unknown',
              transactionId: obj.transaction_id || obj.reference || `PAY-${obj.id}`,
              amount: parseFloat(obj.amount || '0'),
              currency: String(obj.currency || 'EUR'),
              status: String(obj.status || 'completed'),
              gatewayResponse: obj.gateway_response ? String(obj.gateway_response) : null,
              paidAt: obj.created_at ? new Date(obj.created_at) : null,
              createdAt: obj.created_at ? new Date(obj.created_at) : new Date(),
              updatedAt: obj.updated_at ? new Date(obj.updated_at) : new Date()
            }
          })
          paymentsImported++
          if (paymentsImported % 500 === 0) {
            console.log(`  Progress: ${paymentsImported} payments imported`)
          }
        }
      } catch (error) {
        // Silently skip errors (foreign key constraints, etc)
      }
    }
    
    // Reset when we hit a semicolon
    if (line.endsWith(';')) {
      currentTable = ''
      columns = []
    }
  }
  
  console.log('\n✅ Import completed!')
  console.log(`  Products: ${productsImported} imported`)
  console.log(`  Orders: ${ordersImported} imported`)
  console.log(`  Payments: ${paymentsImported} imported`)
}

async function main() {
  const sqlFilePath = process.argv[2]
  
  if (!sqlFilePath) {
    console.error('❌ Please provide the path to your SQL dump file')
    console.error('Usage: npx tsx scripts/import-exact-data.ts /path/to/dump.sql')
    process.exit(1)
  }
  
  try {
    await importFromSQL(sqlFilePath)
  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()