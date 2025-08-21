import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import https from 'https'
import { createWriteStream } from 'fs'

const prisma = new PrismaClient()

async function downloadFile(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = createWriteStream(dest)
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close()
        fs.unlink(dest).catch(() => {}) // Delete failed download
        resolve(false)
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve(true)
      })
      
      file.on('error', () => {
        file.close()
        fs.unlink(dest).catch(() => {})
        resolve(false)
      })
    }).on('error', () => {
      file.close()
      fs.unlink(dest).catch(() => {})
      resolve(false)
    })
  })
}

async function main() {
  // Create directories
  const baseDir = path.join(process.cwd(), 'public', 'images', 'video-thumbnails')
  await fs.mkdir(baseDir, { recursive: true })
  
  // Get all unique video previews
  const videos = await prisma.video.findMany({
    where: {
      videoPreview: { not: null },
      videoDeleted: false
    },
    select: {
      id: true,
      title: true,
      videoPreview: true,
      videoPreviewExternal: true
    }
  })
  
  console.log(`Found ${videos.length} videos with thumbnails`)
  
  let downloadCount = 0
  let skipCount = 0
  let errorCount = 0
  
  for (const video of videos) {
    // Determine thumbnail URL
    let thumbnailUrl = null
    
    if (video.videoPreviewExternal) {
      thumbnailUrl = video.videoPreviewExternal
    } else if (video.videoPreview) {
      if (video.videoPreview.startsWith('http')) {
        thumbnailUrl = video.videoPreview
      } else {
        thumbnailUrl = `https://old.fitq.me/storage/${video.videoPreview}`
      }
    }
    
    if (!thumbnailUrl) {
      skipCount++
      continue
    }
    
    // Generate local filename
    const ext = path.extname(thumbnailUrl) || '.jpg'
    const localPath = path.join(baseDir, `video-${video.id}${ext}`)
    const publicPath = `/images/video-thumbnails/video-${video.id}${ext}`
    
    // Check if already downloaded
    try {
      await fs.access(localPath)
      console.log(`Already exists: ${video.id} - ${video.title}`)
      skipCount++
      continue
    } catch {
      // File doesn't exist, download it
    }
    
    // Download the thumbnail
    console.log(`Downloading: ${video.id} - ${video.title}`)
    const success = await downloadFile(thumbnailUrl, localPath)
    
    if (success) {
      downloadCount++
      
      // Update database with local path
      await prisma.video.update({
        where: { id: video.id },
        data: { 
          videoPreview: publicPath,
          videoPreviewExternal: null // Clear external URL since we have local copy
        }
      })
      
      console.log(`✓ Downloaded and updated: ${video.id}`)
    } else {
      errorCount++
      console.log(`✗ Failed to download: ${video.id} from ${thumbnailUrl}`)
    }
    
    // Add small delay to avoid overwhelming the server
    if (downloadCount % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log('\n=== DOWNLOAD SUMMARY ===')
  console.log(`Downloaded: ${downloadCount}`)
  console.log(`Skipped: ${skipCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log(`Total: ${videos.length}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)