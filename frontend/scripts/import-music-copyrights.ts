import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import readline from 'readline'

const prisma = new PrismaClient()

async function importMusicCopyrights() {
  console.log('Starting music copyrights import...')
  
  // Clear existing data
  await prisma.videoMusicCopyright.deleteMany({})
  console.log('Cleared existing music copyrights')
  
  const sqlFile = '/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql'
  const fileStream = fs.createReadStream(sqlFile)
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })
  
  let inMusicCopyrightsInsert = false
  let insertBuffer = ''
  let totalImported = 0
  
  for await (const line of rl) {
    // Check if we're starting a video_music_copyrights INSERT
    if (line.includes('INSERT INTO `video_music_copyrights`')) {
      inMusicCopyrightsInsert = true
      insertBuffer = ''
    }
    
    if (inMusicCopyrightsInsert) {
      insertBuffer += line + '\n'
      
      // Check if this line ends the INSERT statement
      if (line.endsWith(';')) {
        // Parse the INSERT statement
        const matches = insertBuffer.matchAll(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*(NULL|'[^']*'),\s*'([^']*)',\s*'([^']*)',\s*(NULL|'[^']*')\)/g)
        
        const records = []
        for (const match of matches) {
          const [, id, videoId, title, artist, data, createdAt, updatedAt, deletedAt] = match
          
          // Skip deleted records
          if (deletedAt !== 'NULL') {
            continue
          }
          
          records.push({
            videoId: parseInt(videoId),
            title: title.replace(/\\'/g, "'"),
            artist: artist.replace(/\\'/g, "'"),
            data: data === 'NULL' ? null : data.replace(/'/g, '').replace(/\\'/g, "'"),
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt)
          })
        }
        
        if (records.length > 0) {
          try {
            await prisma.videoMusicCopyright.createMany({
              data: records,
              skipDuplicates: true
            })
            totalImported += records.length
            console.log(`Imported ${records.length} music copyrights (Total: ${totalImported})`)
          } catch (error) {
            console.error('Error importing batch:', error)
          }
        }
        
        inMusicCopyrightsInsert = false
        insertBuffer = ''
      }
    }
  }
  
  console.log(`\nImport complete! Total records imported: ${totalImported}`)
  
  // Show some statistics
  const stats = await prisma.videoMusicCopyright.groupBy({
    by: ['videoId'],
    _count: true
  })
  
  console.log(`\nVideos with music copyrights: ${stats.length}`)
  
  // Show sample data
  const samples = await prisma.videoMusicCopyright.findMany({
    take: 5,
    orderBy: { id: 'asc' }
  })
  
  console.log('\nSample imported data:')
  for (const sample of samples) {
    console.log(`  Video ${sample.videoId}: "${sample.title}" by ${sample.artist}`)
  }
  
  await prisma.$disconnect()
}

importMusicCopyrights().catch(console.error)