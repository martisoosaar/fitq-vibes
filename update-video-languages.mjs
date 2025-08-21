import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateVideoLanguages() {
  try {
    console.log('Updating video language IDs...')

    // Map old language IDs from videoLanguage field to new language IDs
    const langMap = {
      '1': 1,  // English
      '2': 2,  // Estonian
      '3': 3,  // Russian
      '4': 4,  // Latvian
      '6': 6   // Lithuanian
    }

    for (const [oldId, newId] of Object.entries(langMap)) {
      const result = await prisma.video.updateMany({
        where: { 
          videoLanguage: oldId 
        },
        data: { 
          languageId: newId 
        }
      })
      console.log(`✅ Updated ${result.count} videos with language ID: ${oldId} -> ${newId}`)
    }

    // Get statistics
    const stats = await prisma.video.groupBy({
      by: ['languageId'],
      _count: {
        languageId: true
      }
    })

    console.log('\n📊 Language distribution:')
    for (const stat of stats) {
      if (stat.languageId) {
        const lang = await prisma.language.findUnique({
          where: { id: stat.languageId }
        })
        console.log(`   ${lang?.languageName}: ${stat._count.languageId} videos`)
      } else {
        console.log(`   No language: ${stat._count.languageId} videos`)
      }
    }

    console.log('\n✅ All done!')

  } catch (error) {
    console.error('Error updating video languages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateVideoLanguages()