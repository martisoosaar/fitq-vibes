import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Read the JSON file
const programsData = JSON.parse(fs.readFileSync('/tmp/programs.json', 'utf-8'))

console.log(`Found ${programsData.length} programs to import`)

async function importPrograms() {
  try {
    // Delete existing programs
    await prisma.trainerProgram.deleteMany()
    console.log('Cleared existing programs')
    
    let imported = 0
    let skipped = 0
    
    for (const program of programsData) {
      try {
        // Check if trainer exists
        const trainer = await prisma.user.findUnique({
          where: { id: program.trainer_id }
        })
        
        if (!trainer) {
          console.log(`Skipping program ${program.id} - trainer ${program.trainer_id} not found`)
          skipped++
          continue
        }
        
        await prisma.trainerProgram.create({
          data: {
            id: BigInt(program.id),
            trainerId: program.trainer_id,
            title: program.title || '',
            shortDescription: program.short_description || '',
            description: program.description || '',
            picture: program.picture,
            urlSlug: program.url_slug,
            faq: program.faq,
            unitLength: program.unit_length || 'DAY',
            unitVisibility: program.unit_visibility || 'VISIBLE_AFTER_PREVIOUS',
            languageId: program.language_id,
            status: program.status || 'DRAFT',
            commentsEnabled: program.comments_enabled === 1,
            feedbackEnabled: program.feedback_enabled === 1,
            createdAt: program.created_at ? new Date(program.created_at) : null,
            updatedAt: program.updated_at ? new Date(program.updated_at) : null,
            deletedAt: program.deleted_at ? new Date(program.deleted_at) : null
          }
        })
        
        imported++
        console.log(`Imported program ${program.id}: ${program.title}`)
      } catch (error: any) {
        console.error(`Error importing program ${program.id}:`, error.message)
        skipped++
      }
    }
    
    console.log(`\nImport complete: ${imported} programs imported, ${skipped} skipped`)
    
    // Show some stats
    const totalPrograms = await prisma.trainerProgram.count()
    const publicPrograms = await prisma.trainerProgram.count({
      where: { status: 'PUBLIC' }
    })
    
    console.log(`\nDatabase stats:`)
    console.log(`- Total programs: ${totalPrograms}`)
    console.log(`- Public programs: ${publicPrograms}`)
    
  } catch (error) {
    console.error('Error importing programs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importPrograms()