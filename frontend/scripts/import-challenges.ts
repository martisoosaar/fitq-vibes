import { PrismaClient } from '@prisma/client'
import mysql from 'mysql2/promise'

const prisma = new PrismaClient()

async function importChallenges() {
  // Connect to legacy database
  const legacyDb = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'M1nupar007',
    database: 'fitq_legacy'
  })

  try {
    console.log('Starting challenges import...')

    // Get all challenges from legacy database
    const [challenges] = await legacyDb.execute(`
      SELECT 
        id,
        name,
        description,
        image,
        content,
        slides,
        includes,
        commune,
        type,
        is_subscription_needed,
        path,
        begin_date,
        end_date,
        user_id,
        min_team,
        max_team,
        challenge_visible,
        created_at,
        updated_at
      FROM challenges
      ORDER BY id
    `)

    console.log(`Found ${(challenges as any[]).length} challenges to import`)

    // Import each challenge
    for (const challenge of challenges as any[]) {
      try {
        // Check if challenge exists
        const existingChallenge = await prisma.challenge.findFirst({
          where: { id: challenge.id }
        })

        if (existingChallenge) {
          console.log(`Challenge ${challenge.id} already exists, skipping...`)
          continue
        }

        // Create challenge
        await prisma.challenge.create({
          data: {
            id: challenge.id,
            name: challenge.name,
            description: challenge.description,
            image: challenge.image || '',
            content: challenge.content || '',
            slides: challenge.slides || '',
            includes: challenge.includes || '',
            commune: challenge.commune || '',
            type: challenge.type,
            isSubscriptionNeeded: challenge.is_subscription_needed || 0,
            path: challenge.path,
            beginDate: challenge.begin_date ? new Date(challenge.begin_date) : null,
            endDate: challenge.end_date ? new Date(challenge.end_date) : null,
            userId: challenge.user_id,
            minTeam: challenge.min_team,
            maxTeam: challenge.max_team,
            challengeVisible: challenge.challenge_visible || 1,
            createdAt: challenge.created_at ? new Date(challenge.created_at) : null,
            updatedAt: challenge.updated_at ? new Date(challenge.updated_at) : new Date()
          }
        })

        console.log(`✓ Imported challenge ${challenge.id}: ${challenge.name}`)
      } catch (error) {
        console.error(`Error importing challenge ${challenge.id}:`, error)
      }
    }

    console.log('Challenges import completed!')

  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    await legacyDb.end()
    await prisma.$disconnect()
  }
}

// Run the import
importChallenges()