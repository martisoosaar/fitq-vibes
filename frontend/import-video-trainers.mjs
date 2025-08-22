import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

// SQL dump file path
const sqlFile = '/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql'

async function importVideoTrainers() {
  try {
    console.log('Reading SQL dump file...')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    // Find the INSERT statement for video_trainers
    const insertMatch = sqlContent.match(/INSERT INTO `video_trainers`[^;]+;/s)
    if (!insertMatch) {
      console.log('No video_trainers data found in SQL dump')
      return
    }
    
    const insertStatement = insertMatch[0]
    
    // Extract values using regex
    const valuesMatch = insertStatement.match(/VALUES\s+([\s\S]+);/)
    if (!valuesMatch) {
      console.log('No VALUES found in INSERT statement')
      return
    }
    
    const valuesString = valuesMatch[1]
    
    // Parse each row
    const rows = []
    const rowPattern = /\((\d+),\s*(\d+),\s*(\d+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/g
    let match
    
    while ((match = rowPattern.exec(valuesString)) !== null) {
      const [_, id, videoId, trainerId, createdAt, updatedAt, deletedAt] = match
      
      // Check if trainer and video exist
      const [trainerExists, videoExists] = await Promise.all([
        prisma.user.findUnique({ where: { id: parseInt(trainerId) } }),
        prisma.video.findUnique({ where: { id: parseInt(videoId) } })
      ])
      
      if (!trainerExists || !videoExists) {
        console.log(`Skipping: trainer ${trainerId} exists: ${!!trainerExists}, video ${videoId} exists: ${!!videoExists}`)
        continue
      }
      
      rows.push({
        id: parseInt(id),
        videoId: parseInt(videoId),
        trainerId: parseInt(trainerId),
        createdAt: createdAt === 'NULL' ? null : new Date(createdAt.replace(/'/g, '')),
        updatedAt: updatedAt === 'NULL' ? null : new Date(updatedAt.replace(/'/g, '')),
        deletedAt: deletedAt === 'NULL' ? null : new Date(deletedAt.replace(/'/g, ''))
      })
    }
    
    console.log(`Found ${rows.length} video trainer relationships to import`)
    
    if (rows.length === 0) {
      console.log('No valid video trainer relationships to import')
      return
    }
    
    // Import using createMany (allows duplicates to be skipped)
    for (const row of rows) {
      try {
        await prisma.videoTrainer.upsert({
          where: { id: row.id },
          update: row,
          create: row
        })
        console.log(`Imported video trainer relationship: video ${row.videoId} - trainer ${row.trainerId}`)
      } catch (error) {
        console.error(`Failed to import video trainer ${row.id}:`, error.message)
      }
    }
    
    // Get statistics
    const totalRelationships = await prisma.videoTrainer.count()
    const uniqueTrainers = await prisma.videoTrainer.findMany({
      distinct: ['trainerId'],
      select: { trainerId: true }
    })
    
    console.log(`\n✅ Import complete!`)
    console.log(`Total video-trainer relationships: ${totalRelationships}`)
    console.log(`Unique trainers: ${uniqueTrainers.length}`)
    
    // Show sample data with trainer names
    const samples = await prisma.videoTrainer.findMany({
      take: 5,
      include: {
        video: {
          select: { id: true, title: true }
        },
        trainer: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    console.log('\nSample video-trainer relationships:')
    samples.forEach(rel => {
      console.log(`- Video "${rel.video.title}" (ID: ${rel.video.id}) - Trainer: ${rel.trainer.name || rel.trainer.email} (ID: ${rel.trainer.id})`)
    })
    
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importVideoTrainers()