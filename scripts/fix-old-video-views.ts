import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOldVideoViews() {
  console.log('Starting to fix old video views...')
  
  try {
    // Get all video views where playheadPosition is 0 but watchTimeSeconds > 0
    // These are likely old completed views
    const oldViews = await prisma.videoView.findMany({
      where: {
        playheadPosition: 0,
        watchTimeSeconds: {
          gt: 0
        }
      },
      include: {
        video: {
          select: {
            duration: true
          }
        }
      }
    })
    
    console.log(`Found ${oldViews.length} old views to fix`)
    
    let updatedCount = 0
    
    for (const view of oldViews) {
      // For old views, assume they watched the entire video
      // Set playheadPosition to match watchTimeSeconds and mark as not still watching
      await prisma.videoView.update({
        where: { id: view.id },
        data: {
          playheadPosition: view.watchTimeSeconds,
          stillWatching: false
        }
      })
      updatedCount++
      
      if (updatedCount % 100 === 0) {
        console.log(`Updated ${updatedCount} views...`)
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} old video views`)
    
    // Also update views that are older than 1 week with stillWatching=true
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const result = await prisma.videoView.updateMany({
      where: {
        stillWatching: true,
        createdAt: {
          lt: oneWeekAgo
        }
      },
      data: {
        stillWatching: false
      }
    })
    
    console.log(`✅ Marked ${result.count} old incomplete views as completed`)
    
  } catch (error) {
    console.error('Error fixing old video views:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
fixOldVideoViews()