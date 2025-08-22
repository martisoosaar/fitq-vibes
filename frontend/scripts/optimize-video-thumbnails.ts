import { prisma } from '../lib/db'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

async function optimizeVideoThumbnails() {
  console.log('🖼️  Starting video thumbnail optimization...')
  
  const publicDir = path.join(process.cwd(), 'public', 'images', 'video-thumbnails')
  
  // Get all video files in thumbnails directory
  const files = fs.readdirSync(publicDir)
  const videoFiles = files.filter(f => f.startsWith('video-') && (f.endsWith('.jpg') || f.endsWith('.png')))
  
  console.log(`Found ${videoFiles.length} thumbnail files`)
  
  let converted = 0
  let updated = 0
  let errors = 0
  
  for (const file of videoFiles) {
    try {
      const filePath = path.join(publicDir, file)
      const videoId = parseInt(file.match(/video-(\d+)/)?.[1] || '0')
      
      if (!videoId) {
        console.log(`⚠️  Skipping invalid filename: ${file}`)
        continue
      }
      
      const isPng = file.endsWith('.png')
      const targetPath = path.join(publicDir, `video-${videoId}.jpg`)
      const thumbnailUrl = `/images/video-thumbnails/video-${videoId}.jpg`
      
      // Convert PNG to JPG if needed
      if (isPng) {
        console.log(`🔄 Converting ${file} to JPG...`)
        
        await sharp(filePath)
          .jpeg({ quality: 85, progressive: true })
          .toFile(targetPath)
        
        // Remove original PNG file
        fs.unlinkSync(filePath)
        converted++
        
        console.log(`✅ Converted: ${file} → video-${videoId}.jpg`)
      }
      
      // Update database record
      const video = await prisma.videos.findUnique({
        where: { id: videoId },
        select: { id: true, video_preview: true }
      })
      
      if (video) {
        // Update video_preview to point to local JPG
        await prisma.videos.update({
          where: { id: videoId },
          data: { video_preview: thumbnailUrl }
        })
        updated++
        
        if (updated % 50 === 0) {
          console.log(`📊 Progress: ${updated} videos updated`)
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error)
      errors++
    }
  }
  
  console.log('\n🎯 Optimization complete!')
  console.log(`📈 Stats:`)
  console.log(`   - Files processed: ${videoFiles.length}`)
  console.log(`   - PNG → JPG conversions: ${converted}`)
  console.log(`   - Database updates: ${updated}`)
  console.log(`   - Errors: ${errors}`)
  
  // Check for videos without thumbnails
  const videosWithoutThumbnails = await prisma.videos.findMany({
    where: {
      OR: [
        { video_preview: null },
        { video_preview: '' }
      ]
    },
    select: { id: true, title: true },
    take: 10
  })
  
  if (videosWithoutThumbnails.length > 0) {
    console.log(`\n⚠️  Videos without thumbnails (showing first 10):`)
    videosWithoutThumbnails.forEach(v => {
      console.log(`   ID ${v.id}: ${v.title}`)
    })
  }
}

optimizeVideoThumbnails().catch(console.error)
