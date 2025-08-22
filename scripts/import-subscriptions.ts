import { PrismaClient } from '@prisma/client'
import * as mysql from 'mysql2/promise'

const prisma = new PrismaClient()

async function importSubscriptions() {
  console.log('Starting subscriptions import...')
  
  // Connect to legacy database
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'M1nupar007',
    database: 'fitq_legacy'
  })

  // Get user subscriptions from legacy
  const [subscriptions] = await connection.execute(`
    SELECT 
      us.id,
      us.user_id,
      us.trainer_id,
      us.subscription_start,
      us.subscription_end,
      us.canceled_time,
      us.active,
      us.free,
      us.created_at,
      us.updated_at
    FROM users_subscriptions us
    WHERE us.active = 1
    ORDER BY us.id
  `) as any

  console.log(`Found ${subscriptions.length} subscriptions to import`)

  // Clear existing subscriptions
  await prisma.userSubscription.deleteMany()
  console.log('Cleared existing subscriptions')

  let imported = 0
  let errors = 0

  for (const sub of subscriptions) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: sub.user_id }
      })
      
      if (!user) {
        console.log(`User ${sub.user_id} not found, skipping subscription ${sub.id}`)
        errors++
        continue
      }

      // Check if trainer exists - but don't skip, just set to null
      let actualTrainerId = null
      if (sub.trainer_id) {
        const trainer = await prisma.trainer.findFirst({
          where: { userId: sub.trainer_id }
        })
        
        if (trainer) {
          actualTrainerId = trainer.id
        }
      }

      await prisma.userSubscription.create({
        data: {
          id: sub.id,
          userId: sub.user_id,
          trainerId: actualTrainerId,
          status: sub.active ? 'active' : 'cancelled',
          monthlyPrice: 0,
          currency: 'EUR',
          createdAt: sub.subscription_start ? new Date(sub.subscription_start) : sub.created_at ? new Date(sub.created_at) : new Date(),
          canceledAt: sub.canceled_time ? new Date(sub.canceled_time) : null,
          pausedAt: null,
          expiredAt: sub.subscription_end ? new Date(sub.subscription_end) : null
        }
      })
      
      imported++
      if (imported % 100 === 0) {
        console.log(`Progress: ${imported} subscriptions imported`)
      }
    } catch (error) {
      console.error(`Error importing subscription ${sub.id}:`, error)
      errors++
    }
  }

  // Also import premium subscriptions
  const [premiumSubs] = await connection.execute(`
    SELECT 
      u.id as user_id,
      u.trial_end,
      u.created_at
    FROM users u
    WHERE u.trial_end IS NOT NULL
      AND u.trial_end > NOW()
  `) as any

  console.log(`\nFound ${premiumSubs.length} premium subscriptions`)

  for (const user of premiumSubs) {
    try {
      const exists = await prisma.user.findUnique({
        where: { id: user.user_id }
      })
      
      if (!exists) continue

      // Check if subscription already exists
      const existing = await prisma.userSubscription.findFirst({
        where: {
          userId: user.user_id,
          trainerId: null
        }
      })

      if (!existing) {
        await prisma.userSubscription.create({
          data: {
            userId: user.user_id,
            trainerId: null,
            status: 'active',
            monthlyPrice: 0,
            currency: 'EUR',
            createdAt: user.created_at ? new Date(user.created_at) : new Date(),
            expiredAt: user.trial_end ? new Date(user.trial_end) : null
          }
        })
        imported++
      }
    } catch (error) {
      console.error(`Error importing premium subscription for user ${user.user_id}:`, error)
      errors++
    }
  }

  await connection.end()
  
  console.log(`\nSubscriptions import completed!`)
  console.log(`Imported: ${imported}`)
  console.log(`Errors: ${errors}`)
}

importSubscriptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())