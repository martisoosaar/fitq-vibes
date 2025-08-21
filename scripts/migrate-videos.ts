import { PrismaClient } from '@prisma/client'
import mysql from 'mysql2/promise'

const prisma = new PrismaClient()

async function main() {
  // Connect to legacy database
  const legacyConnection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'M1nupar007',
    database: 'fitq_legacy'
  })

  console.log('Connected to legacy database')

  // First, migrate categories
  const [categories] = await legacyConnection.execute('SELECT * FROM video_categories') as any[]
  
  console.log(`Found ${categories.length} categories`)
  
  for (const cat of categories) {
    await prisma.videoCategory.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        image: cat.image
      },
      create: {
        id: cat.id,
        name: cat.name,
        image: cat.image,
        createdAt: cat.created_at ? new Date(cat.created_at) : new Date(),
        updatedAt: cat.updated_at ? new Date(cat.updated_at) : new Date()
      }
    })
  }
  
  console.log('Categories migrated')

  // Get all videos from legacy database
  const [videos] = await legacyConnection.execute(`
    SELECT 
      v.*,
      u.trainer_unlocked
    FROM videos v
    LEFT JOIN users u ON v.user_id = u.id
    WHERE v.video_deleted = 0
    ORDER BY v.id
  `) as any[]

  console.log(`Found ${videos.length} active videos to migrate`)

  // Clear existing videos
  await prisma.video.deleteMany()
  console.log('Cleared existing videos')

  // Migrate videos in batches
  const batchSize = 50
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize)
    
    for (const video of batch) {
      try {
        // Check if user exists
        const userExists = await prisma.user.findUnique({
          where: { id: video.user_id }
        })
        
        if (!userExists) {
          console.log(`Skipping video ${video.id} - user ${video.user_id} not found`)
          errorCount++
          continue
        }

        // Check if trainer exists
        let trainerId = null
        if (video.trainer_unlocked === 1) {
          const trainer = await prisma.trainer.findUnique({
            where: { id: video.user_id }
          })
          if (trainer) {
            trainerId = trainer.id
          }
        }

        await prisma.video.create({
          data: {
            id: video.id,
            userId: video.user_id,
            title: video.title || 'Untitled',
            description: video.description || '',
            duration: video.duration || 0,
            categoryId: video.category || 3, // Default to strength if missing
            equipment: video.equipment,
            energyConsumption: video.energy_consumption || 0,
            keywords: video.keywords,
            
            // Availability
            live: video.live === 1,
            onDemand: video.on_demand === 1,
            recommend: video.recommend,
            startTime: video.start_time ? new Date(video.start_time) : null,
            endTime: video.end_time ? new Date(video.end_time) : null,
            availableFrom: video.available_from ? new Date(video.available_from) : null,
            availableUntil: video.available_until ? new Date(video.available_until) : null,
            
            // Access control
            openForSubscribers: video.open_for_subsribers === 1,
            openForTickets: video.open_for_tickets === 1,
            openForFree: video.open_for_free === 1,
            singleTicketPrice: video.single_ticket_price || 0,
            
            // Video data
            iframe: video.iframe,
            videoPreview: video.video_preview,
            videoPreviewExternal: video.video_preview_external,
            videoLanguage: video.video_language,
            videoPlatform: video.video_platform,
            playbackUrl: video.playback_url,
            vimeoId: video.vimeo_id,
            recordId: video.record_id,
            
            // Status
            hidden: video.hidden === 1,
            hiddenHash: video.hidden_hash,
            videoDeleted: false, // Already filtered
            unlisted: video.unlisted,
            reportedBad: video.reported_bad === 1,
            videoTest: video.video_test === 1,
            videoForChallenge: video.video_for_challenge || 0,
            
            // Stats
            views: video.views || 0,
            
            // Trainer relation
            trainerId: trainerId,
            
            createdAt: video.created_at ? new Date(video.created_at) : new Date(),
            updatedAt: video.updated_at ? new Date(video.updated_at) : new Date()
          }
        })
        successCount++
      } catch (error: any) {
        console.error(`Failed to migrate video ${video.id}:`, error.message)
        errorCount++
      }
    }
    
    console.log(`Migrated ${successCount} / ${videos.length} videos (${errorCount} errors)`)
  }

  // Update trainer video counts
  const trainers = await prisma.trainer.findMany()
  for (const trainer of trainers) {
    const videoCount = await prisma.video.count({
      where: { trainerId: trainer.id }
    })
    await prisma.trainer.update({
      where: { id: trainer.id },
      data: { videosCount: videoCount }
    })
  }
  
  console.log('Updated trainer video counts')

  // Reset auto increment
  const maxId = Math.max(...videos.map((v: any) => v.id))
  await prisma.$executeRawUnsafe(`ALTER TABLE Video AUTO_INCREMENT = ${maxId + 1}`)

  console.log(`Migration completed! ${successCount} videos migrated, ${errorCount} errors`)

  // Close connections
  await legacyConnection.end()
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })