import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function importLanguages() {
  try {
    const languages = [
      {
        id: 1,
        languageName: 'english',
        languageNative: null,
        languageAbbr: 'en',
        languageFlag: 'languages/September2020/kfGfLkFOtzTiLLe2H3dY.png'
      },
      {
        id: 2,
        languageName: 'estonian',
        languageNative: null,
        languageAbbr: 'est',
        languageFlag: 'languages/September2020/PHqohThze4DvkAUpzgPo.png'
      },
      {
        id: 3,
        languageName: 'russian',
        languageNative: null,
        languageAbbr: 'ru',
        languageFlag: 'languages/September2020/syAMwFzuLb6ws5y4WyXL.png'
      },
      {
        id: 4,
        languageName: 'latvian',
        languageNative: null,
        languageAbbr: 'lat',
        languageFlag: 'languages/September2020/aMWTH5oO2v8dt7AQAk7U.png'
      },
      {
        id: 6,
        languageName: 'lithuanian',
        languageNative: null,
        languageAbbr: 'lt',
        languageFlag: 'languages/October2020/MZRqvLgHtqRvOGsHV8a9.png'
      }
    ]

    console.log('Importing languages...')

    for (const lang of languages) {
      await prisma.language.upsert({
        where: { id: lang.id },
        update: {
          languageName: lang.languageName,
          languageNative: lang.languageNative,
          languageAbbr: lang.languageAbbr,
          languageFlag: lang.languageFlag
        },
        create: lang
      })
      console.log(`✅ Imported language: ${lang.languageName}`)
    }

    console.log('\n✅ Successfully imported all languages!')

    // Now update videos with language IDs based on videoLanguage field
    console.log('\nUpdating videos with language IDs...')

    // Map language abbreviations from old system to language IDs
    const langMap = {
      'en': 1,
      'est': 2,
      'ru': 3,
      'lat': 4,
      'lt': 6
    }

    for (const [abbr, langId] of Object.entries(langMap)) {
      const result = await prisma.video.updateMany({
        where: { 
          videoLanguage: abbr 
        },
        data: { 
          languageId: langId 
        }
      })
      console.log(`✅ Updated ${result.count} videos with language: ${abbr}`)
    }

    console.log('\n✅ All done!')

  } catch (error) {
    console.error('Error importing languages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importLanguages()