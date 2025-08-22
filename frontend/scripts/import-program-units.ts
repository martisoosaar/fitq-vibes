import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Read the JSON file
const unitsData = JSON.parse(fs.readFileSync('/tmp/program_units.json', 'utf-8'))

console.log(`Found ${unitsData.length} units to import`)

async function importUnits() {
  try {
    // Delete existing units
    await prisma.trainerProgramUnit.deleteMany()
    console.log('Cleared existing program units')
    
    let imported = 0
    let skipped = 0
    
    // Filter only non-deleted units
    const validUnits = unitsData.filter((unit: any) => unit.deleted_at === null)
    console.log(`Processing ${validUnits.length} non-deleted units`)
    
    for (const unit of validUnits) {
      try {
        // Check if program exists
        const program = await prisma.trainerProgram.findUnique({
          where: { id: BigInt(unit.program_id) }
        })
        
        if (!program) {
          console.log(`Skipping unit ${unit.id} - program ${unit.program_id} not found`)
          skipped++
          continue
        }
        
        await prisma.trainerProgramUnit.create({
          data: {
            id: BigInt(unit.id),
            programId: BigInt(unit.program_id),
            order: unit.order,
            title: unit.title || '',
            description: unit.description,
            status: unit.status || 'DRAFT',
            createdAt: unit.created_at ? new Date(unit.created_at) : null,
            updatedAt: unit.updated_at ? new Date(unit.updated_at) : null,
            deletedAt: unit.deleted_at ? new Date(unit.deleted_at) : null
          }
        })
        
        imported++
        if (imported % 100 === 0) {
          console.log(`Imported ${imported} units...`)
        }
      } catch (error: any) {
        console.error(`Error importing unit ${unit.id}:`, error.message)
        skipped++
      }
    }
    
    console.log(`\nImport complete: ${imported} units imported, ${skipped} skipped`)
    
    // Show some stats
    const totalUnits = await prisma.trainerProgramUnit.count()
    const publishedUnits = await prisma.trainerProgramUnit.count({
      where: { status: 'PUBLISHED' }
    })
    
    console.log(`\nDatabase stats:`)
    console.log(`- Total units: ${totalUnits}`)
    console.log(`- Published units: ${publishedUnits}`)
    
  } catch (error) {
    console.error('Error importing units:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importUnits()