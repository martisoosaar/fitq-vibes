import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function importVideoTasks() {
  try {
    // Read the extracted SQL
    const sqlContent = fs.readFileSync('/tmp/video_tasks.sql', 'utf-8')
    
    // Parse the INSERT statements
    const regex = /\((\d+),\s*(\d+),\s*(NULL|\d+),\s*(\d+),\s*([^,]*),\s*([^,]*),\s*([^)]*)\)/g
    const matches = [...sqlContent.matchAll(regex)]
    
    console.log(`Found ${matches.length} video task records to import`)
    
    // Clear existing video tasks first
    await prisma.trainerProgramUnitVideoTask.deleteMany({})
    console.log('Cleared existing video tasks')
    
    let imported = 0
    let skipped = 0
    
    for (const match of matches) {
      const [_, id, unitId, order, videoId, createdAt, updatedAt, deletedAt] = match
      
      // Skip if deleted
      if (deletedAt && deletedAt !== 'NULL') {
        skipped++
        continue
      }
      
      // Check if unit exists
      const unit = await prisma.trainerProgramUnit.findUnique({
        where: { id: BigInt(unitId) }
      })
      
      if (!unit) {
        skipped++
        continue
      }
      
      // Check if video exists
      const video = await prisma.video.findUnique({
        where: { id: parseInt(videoId) }
      })
      
      if (!video) {
        skipped++
        continue
      }
      
      // Import the video task
      try {
        await prisma.trainerProgramUnitVideoTask.create({
          data: {
            id: BigInt(id),
            unitId: BigInt(unitId),
            videoId: parseInt(videoId),
            order: order === 'NULL' ? null : parseInt(order)
          }
        })
        imported++
        
        if (imported % 100 === 0) {
          console.log(`Imported ${imported} video tasks...`)
        }
      } catch (err) {
        // Skip duplicates
      }
    }
    
    console.log(`\nImport complete!`)
    console.log(`- Imported: ${imported} video tasks`)
    console.log(`- Skipped: ${skipped} (deleted or missing references)`)
    
    // Verify unit 1241
    const unit1241 = await prisma.trainerProgramUnit.findFirst({
      where: { id: BigInt(1241) },
      include: {
        videoTasks: {
          include: { video: true }
        }
      }
    })
    
    if (unit1241 && unit1241.videoTasks.length > 0) {
      console.log(`\nUnit 1241 (${unit1241.title}) now has video:`)
      console.log(`  - ${unit1241.videoTasks[0].video.title} (ID: ${unit1241.videoTasks[0].videoId})`)
    }
    
  } catch (error) {
    console.error('Error importing video tasks:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importVideoTasks()