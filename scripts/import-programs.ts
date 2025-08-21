import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Read the SQL file
const sqlFile = path.join('/Users/soss/htdocs/fitq-vibes', 'fitq_live_db (3).sql')
const sqlContent = fs.readFileSync(sqlFile, 'utf-8')

// Find the trainer_programs data
const lines = sqlContent.split('\n')
const startIndex = lines.findIndex(line => line.includes('INSERT INTO `trainer_programs`'))

if (startIndex === -1) {
  console.error('Could not find trainer_programs insert statement')
  process.exit(1)
}

// Extract all program entries
const programs: any[] = []
let currentEntry = ''
let isInData = false

for (let i = startIndex + 1; i < lines.length; i++) {
  const line = lines[i].trim()
  
  if (line.startsWith('(') && line.includes(', ')) {
    isInData = true
    currentEntry = line
    
    // Check if this is a complete entry
    if (line.endsWith('),') || line.endsWith(');')) {
      // Parse the entry
      try {
        // Remove opening ( and closing ),
        let data = currentEntry.slice(1, -2)
        if (currentEntry.endsWith(');')) {
          data = currentEntry.slice(1, -2)
        }
        
        // Use a regular expression to split by commas not inside quotes
        const parts: string[] = []
        let current = ''
        let inQuote = false
        let quoteChar = ''
        
        for (let j = 0; j < data.length; j++) {
          const char = data[j]
          
          if (!inQuote && (char === "'" || char === '"')) {
            inQuote = true
            quoteChar = char
            current += char
          } else if (inQuote && char === quoteChar && data[j - 1] !== '\\') {
            inQuote = false
            current += char
          } else if (!inQuote && char === ',') {
            parts.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        if (current) {
          parts.push(current.trim())
        }
        
        // Parse the fields
        const cleanValue = (val: string) => {
          if (val === 'NULL') return null
          if (val.startsWith("'") && val.endsWith("'")) {
            return val.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\')
          }
          return val
        }
        
        const program = {
          id: parseInt(parts[0]),
          trainerId: parseInt(parts[1]),
          title: cleanValue(parts[2]),
          shortDescription: cleanValue(parts[3]),
          description: cleanValue(parts[4]),
          picture: cleanValue(parts[5]),
          urlSlug: cleanValue(parts[6]),
          faq: cleanValue(parts[7]),
          unitLength: cleanValue(parts[8]) || 'DAY',
          unitVisibility: cleanValue(parts[9]) || 'VISIBLE_AFTER_PREVIOUS',
          languageId: parseInt(parts[10]),
          status: cleanValue(parts[11]) || 'DRAFT',
          commentsEnabled: parts[12] === '1',
          feedbackEnabled: parts[13] === '1',
          createdAt: cleanValue(parts[14]) ? new Date(cleanValue(parts[14])!) : null,
          updatedAt: cleanValue(parts[15]) ? new Date(cleanValue(parts[15])!) : null,
          deletedAt: cleanValue(parts[16]) ? new Date(cleanValue(parts[16])!) : null
        }
        
        programs.push(program)
      } catch (error) {
        console.error('Error parsing entry:', currentEntry)
        console.error(error)
      }
      
      currentEntry = ''
    }
  } else if (isInData && !line.startsWith('--') && line !== '' && !line.startsWith('ALTER') && !line.startsWith('CREATE')) {
    // If we hit a non-data line, stop
    if (line.includes('ALTER TABLE') || line.includes('CREATE TABLE')) {
      break
    }
  }
}

console.log(`Found ${programs.length} programs to import`)

// Import to database
async function importPrograms() {
  try {
    // Delete existing programs
    await prisma.trainerProgram.deleteMany()
    console.log('Cleared existing programs')
    
    // Import programs
    let imported = 0
    let skipped = 0
    
    for (const program of programs) {
      try {
        // Check if trainer exists
        const trainer = await prisma.user.findUnique({
          where: { id: program.trainerId }
        })
        
        if (!trainer) {
          console.log(`Skipping program ${program.id} - trainer ${program.trainerId} not found`)
          skipped++
          continue
        }
        
        await prisma.trainerProgram.create({
          data: {
            id: BigInt(program.id),
            trainerId: program.trainerId,
            title: program.title || '',
            shortDescription: program.shortDescription || '',
            description: program.description || '',
            picture: program.picture,
            urlSlug: program.urlSlug,
            faq: program.faq,
            unitLength: program.unitLength,
            unitVisibility: program.unitVisibility,
            languageId: program.languageId,
            status: program.status,
            commentsEnabled: program.commentsEnabled,
            feedbackEnabled: program.feedbackEnabled,
            createdAt: program.createdAt,
            updatedAt: program.updatedAt,
            deletedAt: program.deletedAt
          }
        })
        
        imported++
        console.log(`Imported program ${program.id}: ${program.title}`)
      } catch (error) {
        console.error(`Error importing program ${program.id}:`, error)
        skipped++
      }
    }
    
    console.log(`\nImport complete: ${imported} programs imported, ${skipped} skipped`)
    
  } catch (error) {
    console.error('Error importing programs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importPrograms()