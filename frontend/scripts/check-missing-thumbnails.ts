import { prisma } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function checkMissingThumbnails() {
  const videos = await prisma.videos.findMany({
    select: { id: true, title: true },
    orderBy: { id: 'desc' },
    take: 100
  })
  
  const publicDir = path.join(process.cwd(), 'public', 'images', 'video-thumbnails')
  const missingThumbnails: { id: number, title: string, hasJpg: boolean, hasPng: boolean }[] = []
  
  for (const video of videos) {
    const jpgPath = path.join(publicDir, `video-${video.id}.jpg`)
    const pngPath = path.join(publicDir, `video-${video.id}.png`)
    
    const hasJpg = fs.existsSync(jpgPath)
    const hasPng = fs.existsSync(pngPath)
    
    if (!hasJpg && !hasPng) {
      missingThumbnails.push({
        id: video.id,
        title: video.title,
        hasJpg,
        hasPng
      })
    }
  }
  
  console.log(`Checked ${videos.length} videos`)
  console.log(`Missing thumbnails: ${missingThumbnails.length}`)
  
  if (missingThumbnails.length > 0) {
    console.log('\nVideos without thumbnails:')
    missingThumbnails.forEach(v => {
      console.log(`ID ${v.id}: ${v.title}`)
    })
  }
}

checkMissingThumbnails().catch(console.error)
