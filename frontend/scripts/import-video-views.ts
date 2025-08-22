import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

interface LegacyVideoView {
  id: number
  video_id: number
  user_id: number
  trainer_id: number
  watch_time_seconds: number
  calories_burned: number | null
  paid: number
  user_cash: number
  trainer_cash: number
  currently_watching_live: number
  created_at: string
  updated_at: string
}

function parseSQLDump(): LegacyVideoView[] {
  const sqlContent = fs.readFileSync('/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql', 'utf-8')
  const insertMatch = sqlContent.match(/INSERT INTO `video_time_watched_by_users`[^;]+;/gs)
  
  if (!insertMatch) {
    throw new Error('No video_time_watched_by_users INSERT statements found')
  }
  
  const legacyViews: LegacyVideoView[] = []
  
  for (const statement of insertMatch) {
    const valuesMatch = statement.match(/VALUES\s*(.+);/s)
    if (!valuesMatch) continue
    
    const valuesPart = valuesMatch[1]
    const rows = valuesPart.split(/\),\s*\(/)
    
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i]
      if (i === 0) row = row.replace(/^\(/, '')
      if (i === rows.length - 1) row = row.replace(/\)$/, '')
      
      const values = row.split(',').map(v => v.trim().replace(/^'|'$/g, ''))
      
      legacyViews.push({
        id: parseInt(values[0]),
        video_id: parseInt(values[1]),
        user_id: parseInt(values[2]),
        trainer_id: parseInt(values[3]),
        watch_time_seconds: parseInt(values[4]),
        calories_burned: values[5] === 'NULL' ? null : parseInt(values[5]),
        paid: parseInt(values[6]),
        user_cash: parseFloat(values[7]),
        trainer_cash: parseFloat(values[8]),
        currently_watching_live: parseInt(values[9]),
        created_at: values[10],
        updated_at: values[11]
      })
    }
  }
  
  return legacyViews
}

async function main() {
  console.log('Starting video views import...')
  
  try {
    // Parse video view records from SQL dump
    const legacyViews = parseSQLDump()
    console.log(`Found ${legacyViews.length} video view records`)
    
    let importedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    for (const legacyView of legacyViews) {
      try {
        // Check if video exists in new database
        const video = await prisma.video.findUnique({
          where: { id: legacyView.video_id }
        })
        
        if (!video) {
          console.log(`Video ${legacyView.video_id} not found, skipping view record ${legacyView.id}`)
          skippedCount++
          continue
        }
        
        // Check if user exists in new database
        const user = await prisma.user.findUnique({
          where: { id: legacyView.user_id }
        })
        
        if (!user) {
          console.log(`User ${legacyView.user_id} not found, skipping view record ${legacyView.id}`)
          skippedCount++
          continue
        }
        
        // Check if trainer exists (can be null)
        let trainerId: number | null = null
        if (legacyView.trainer_id && legacyView.trainer_id > 0) {
          const trainer = await prisma.trainer.findUnique({
            where: { id: legacyView.trainer_id }
          })
          if (trainer) {
            trainerId = legacyView.trainer_id
          }
        }
        
        // Check if view record already exists
        const existingView = await prisma.videoView.findFirst({
          where: {
            videoId: legacyView.video_id,
            userId: legacyView.user_id,
            createdAt: new Date(legacyView.created_at)
          }
        })
        
        if (existingView) {
          console.log(`View record already exists for video ${legacyView.video_id} by user ${legacyView.user_id}`)
          skippedCount++
          continue
        }
        
        // Create video view record
        await prisma.videoView.create({
          data: {
            videoId: legacyView.video_id,
            userId: legacyView.user_id,
            trainerId: trainerId,
            watchTimeSeconds: legacyView.watch_time_seconds,
            caloriesBurned: legacyView.calories_burned,
            paid: legacyView.paid === 1,
            userCash: legacyView.user_cash,
            trainerCash: legacyView.trainer_cash,
            currentlyWatchingLive: legacyView.currently_watching_live === 1,
            createdAt: new Date(legacyView.created_at),
            updatedAt: new Date(legacyView.updated_at)
          }
        })
        
        importedCount++
        console.log(`✓ Imported view record ${legacyView.id}: Video ${legacyView.video_id} watched ${legacyView.watch_time_seconds}s by user ${legacyView.user_id}`)
        
      } catch (error) {
        errorCount++
        console.error(`✗ Failed to import view record ${legacyView.id}:`, error)
      }
    }
    
    console.log('\n=== IMPORT SUMMARY ===')
    console.log(`Imported: ${importedCount}`)
    console.log(`Skipped: ${skippedCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Total: ${legacyViews.length}`)
    
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)