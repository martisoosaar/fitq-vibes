import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function importAllVideoData() {
  const sqlFile = '/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql'
  
  try {
    console.log('=== Starting full video data import ===\n')
    
    // 1. Import intro videos
    console.log('1. Importing intro videos...')
    execSync(`sed -n '/INSERT INTO \\\`trainer_program_intro_videos\\\`/,/;$/p' "${sqlFile}" > /tmp/intro_videos.sql`)
    
    const introContent = fs.readFileSync('/tmp/intro_videos.sql', 'utf-8')
    const introRegex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^)]*)\)/g
    const introMatches = [...introContent.matchAll(introRegex)]
    
    console.log(`Found ${introMatches.length} intro video records`)
    
    for (const match of introMatches) {
      const [_, id, programId, vimeoId, vimeoHashParam, createdAt, updatedAt, deletedAt] = match
      
      // Skip if deleted
      if (deletedAt && deletedAt !== 'NULL') continue
      
      // Check if we have a video with this vimeo ID
      const video = await prisma.video.findFirst({
        where: { vimeoId }
      })
      
      if (video) {
        // Update program with intro video
        await prisma.trainerProgram.updateMany({
          where: { id: BigInt(programId) },
          data: { introVideoId: video.id }
        })
        console.log(`  - Set intro video for program ${programId}: ${video.title}`)
      }
    }
    
    // 2. Import video materials
    console.log('\n2. Importing video materials...')
    execSync(`sed -n '/INSERT INTO \\\`trainer_program_unit_video_materials\\\`/,/;$/p' "${sqlFile}" > /tmp/video_materials.sql`)
    
    const materialsContent = fs.readFileSync('/tmp/video_materials.sql', 'utf-8')
    const materialsRegex = /\((\d+),\s*(\d+),\s*(\d+),\s*([^,]*),\s*([^,]*),\s*([^)]*)\)/g
    const materialsMatches = [...materialsContent.matchAll(materialsRegex)]
    
    console.log(`Found ${materialsMatches.length} video material records`)
    
    // Clear existing materials
    await prisma.trainerProgramUnitVideoMaterial.deleteMany({})
    
    let importedMaterials = 0
    for (const match of materialsMatches) {
      const [_, id, unitId, videoId, createdAt, updatedAt, deletedAt] = match
      
      // Skip if deleted
      if (deletedAt && deletedAt !== 'NULL') continue
      
      // Check if unit and video exist
      const unit = await prisma.trainerProgramUnit.findUnique({
        where: { id: BigInt(unitId) }
      })
      
      const video = await prisma.video.findUnique({
        where: { id: parseInt(videoId) }
      })
      
      if (unit && video) {
        try {
          await prisma.trainerProgramUnitVideoMaterial.create({
            data: {
              id: BigInt(id),
              unitId: BigInt(unitId),
              videoId: parseInt(videoId)
            }
          })
          importedMaterials++
        } catch (err) {
          // Skip duplicates
        }
      }
    }
    
    console.log(`  - Imported ${importedMaterials} video materials`)
    
    // 3. Verify some specific units
    console.log('\n3. Verification...')
    
    // Check unit 1241
    const unit1241 = await prisma.trainerProgramUnit.findFirst({
      where: { id: BigInt(1241) },
      include: {
        videoTasks: { include: { video: true } },
        videoMaterials: { include: { video: true } }
      }
    })
    
    if (unit1241) {
      console.log(`\nUnit 1241 (${unit1241.title}):`)
      console.log(`  - Video tasks: ${unit1241.videoTasks.length}`)
      if (unit1241.videoTasks[0]) {
        console.log(`    • ${unit1241.videoTasks[0].video.title}`)
      }
      console.log(`  - Video materials: ${unit1241.videoMaterials.length}`)
    }
    
    // Check a program with intro video
    const programWithIntro = await prisma.trainerProgram.findFirst({
      where: { introVideoId: { not: null } },
      include: { introVideo: true }
    })
    
    if (programWithIntro) {
      console.log(`\nProgram with intro video:`)
      console.log(`  - ${programWithIntro.title}`)
      console.log(`  - Intro: ${programWithIntro.introVideo?.title}`)
    }
    
    console.log('\n=== Import complete! ===')
    
  } catch (error) {
    console.error('Error during import:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importAllVideoData()