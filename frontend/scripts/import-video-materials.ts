import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Read the JSON file
const materialsData = JSON.parse(fs.readFileSync('/tmp/video_materials.json', 'utf-8'))

console.log(`Found ${materialsData.length} video materials to import`)

async function importVideoMaterials() {
  try {
    // Delete existing video materials
    await prisma.trainerProgramUnitVideoMaterial.deleteMany()
    console.log('Cleared existing video materials')
    
    let imported = 0
    let skipped = 0
    
    // Filter only non-deleted materials
    const validMaterials = materialsData.filter((material: any) => material.deleted_at === null)
    console.log(`Processing ${validMaterials.length} non-deleted video materials`)
    
    for (const material of validMaterials) {
      try {
        // Check if unit exists
        const unit = await prisma.trainerProgramUnit.findUnique({
          where: { id: BigInt(material.unit_id) }
        })
        
        if (!unit) {
          console.log(`Skipping material ${material.id} - unit ${material.unit_id} not found`)
          skipped++
          continue
        }
        
        // Check if video exists
        const video = await prisma.video.findUnique({
          where: { id: material.video_id }
        })
        
        if (!video) {
          console.log(`Skipping material ${material.id} - video ${material.video_id} not found`)
          skipped++
          continue
        }
        
        await prisma.trainerProgramUnitVideoMaterial.create({
          data: {
            id: BigInt(material.id),
            unitId: BigInt(material.unit_id),
            videoId: material.video_id,
            createdAt: material.created_at ? new Date(material.created_at) : null,
            updatedAt: material.updated_at ? new Date(material.updated_at) : null,
            deletedAt: material.deleted_at ? new Date(material.deleted_at) : null
          }
        })
        
        imported++
        if (imported % 20 === 0) {
          console.log(`Imported ${imported} video materials...`)
        }
      } catch (error: any) {
        console.error(`Error importing material ${material.id}:`, error.message)
        skipped++
      }
    }
    
    console.log(`\nImport complete: ${imported} video materials imported, ${skipped} skipped`)
    
    // Show some stats
    const totalMaterials = await prisma.trainerProgramUnitVideoMaterial.count()
    
    console.log(`\nDatabase stats:`)
    console.log(`- Total video materials: ${totalMaterials}`)
    
  } catch (error) {
    console.error('Error importing video materials:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importVideoMaterials()