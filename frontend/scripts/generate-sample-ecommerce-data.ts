import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateSampleData() {
  console.log('🚀 Generating sample e-commerce data...\n')
  
  // Helper to generate random date between 2020 and 2024
  function randomDate(start?: Date, end?: Date) {
    const startDate = start || new Date(2020, 0, 1)
    const endDate = end || new Date(2024, 11, 31)
    return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
  }
  
  // Generate Products
  console.log('📦 Generating Products...')
  const productNames = [
    'FitQ Premium Tellimus (1 kuu)',
    'FitQ Premium Tellimus (3 kuud)',
    'FitQ Premium Tellimus (12 kuud)',
    'Personaaltreeningu pakett (5 treeningut)',
    'Personaaltreeningu pakett (10 treeningut)',
    'Online programm: Algaja',
    'Online programm: Edasijõudnu',
    'Treeningvahendite komplekt',
    'FitQ spordipudel',
    'FitQ treeningsärk',
    'Toitumiskava (1 kuu)',
    'Videotreening: Jõusaal',
    'Videotreening: Kodu',
    'FitQ käepaelad (2tk)',
    'Vastupanuslindid komplekt'
  ]
  
  const products = []
  for (let i = 0; i < productNames.length; i++) {
    const created = randomDate()
    const product = await prisma.product.create({
      data: {
        name: productNames[i],
        description: `Kirjeldus: ${productNames[i]}`,
        price: Math.floor(Math.random() * 150) + 10,
        sku: `FITQ-${1000 + i}`,
        stockQuantity: Math.floor(Math.random() * 100),
        category: i < 3 ? 'Tellimused' : i < 7 ? 'Programmid' : 'Tooted',
        isActive: true,
        createdAt: created,
        updatedAt: created
      }
    })
    products.push(product)
  }
  console.log(`✅ Created ${products.length} products`)
  
  // Generate Orders
  console.log('\n📋 Generating Orders...')
  const orderStatuses = ['pending', 'processing', 'completed', 'cancelled']
  const customerNames = [
    'Mari Maasikas', 'Peeter Porgand', 'Anna Aas', 'Toomas Tamm',
    'Liisa Lill', 'Jüri Juurikas', 'Kadri Kask', 'Mart Mets',
    'Eve Eha', 'Raul Roos', 'Piret Paju', 'Ants Arula',
    'Tiina Teder', 'Urmas Uus', 'Sirje Saar', 'Kalev Kivi'
  ]
  
  const orders = []
  for (let i = 0; i < 50; i++) {
    const created = randomDate()
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)]
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORDER-${2000 + i}`,
        customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
        customerName: customerName,
        customerPhone: `+3725${Math.floor(Math.random() * 9000000) + 1000000}`,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        totalAmount: Math.floor(Math.random() * 500) + 20,
        currency: 'EUR',
        notes: Math.random() > 0.7 ? 'Kiire tarne soovitud' : null,
        createdAt: created,
        updatedAt: created
      }
    })
    orders.push(order)
  }
  console.log(`✅ Created ${orders.length} orders`)
  
  // Generate Payments
  console.log('\n💳 Generating Payments...')
  const paymentMethods = ['card', 'bank_transfer', 'swedbank', 'montonio', 'stripe']
  const paymentStatuses = ['pending', 'completed', 'failed', 'refunded']
  
  for (let i = 0; i < 75; i++) {
    const order = orders[Math.floor(Math.random() * orders.length)]
    const created = new Date(order.createdAt.getTime() + Math.random() * 86400000) // Within 24h of order
    
    await prisma.payment.create({
      data: {
        orderId: Math.random() > 0.2 ? order.id : null, // 80% linked to orders
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        transactionId: `TXN-${Date.now()}-${i}`,
        amount: order.totalAmount,
        currency: 'EUR',
        status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paidAt: created,
        createdAt: created,
        updatedAt: created
      }
    })
  }
  console.log(`✅ Created 75 payments`)
  
  console.log('\n🎉 Sample data generation complete!')
}

generateSampleData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })