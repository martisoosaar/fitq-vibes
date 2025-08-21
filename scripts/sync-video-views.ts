import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting video views synchronization...')
  
  try {
    // Get all videos with their current view counts
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        title: true,
        views: true
      }
    })

    console.log(`Found ${videos.length} videos to sync`)
    
    let updatedCount = 0
    let skippedCount = 0
    
    for (const video of videos) {
      // Count actual view records for this video
      const actualViewCount = await prisma.videoView.count({
        where: {
          videoId: video.id
        }
      })
      
      // Update video views if different
      if ((video.views || 0) !== actualViewCount) {
        await prisma.video.update({
          where: { id: video.id },
          data: { views: actualViewCount }
        })
        
        console.log(`✓ Updated video ${video.id} "${video.title}": ${video.views || 0} → ${actualViewCount} views`)
        updatedCount++
      } else {
        console.log(`- Video ${video.id} already synced: ${actualViewCount} views`)
        skippedCount++
      }
    }
    
    console.log('\n=== SYNC SUMMARY ===')
    console.log(`Updated: ${updatedCount}`)
    console.log(`Skipped (already synced): ${skippedCount}`)
    console.log(`Total videos: ${videos.length}`)
    
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)