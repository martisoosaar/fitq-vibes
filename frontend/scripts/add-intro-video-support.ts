import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addIntroVideoSupport() {
  try {
    // First, let's add the introVideoId column to trainer_programs table
    await prisma.$executeRaw`
      ALTER TABLE trainer_programs 
      ADD COLUMN intro_video_id INT NULL,
      ADD CONSTRAINT fk_intro_video
      FOREIGN KEY (intro_video_id) REFERENCES videos(id)
      ON DELETE SET NULL
    `
    
    console.log('✅ Added intro_video_id column to trainer_programs table')
    
    // Create index for better performance
    await prisma.$executeRaw`
      CREATE INDEX idx_intro_video_id ON trainer_programs(intro_video_id)
    `
    
    console.log('✅ Added index for intro_video_id')
    
  } catch (error: any) {
    if (error.message?.includes('Duplicate column name')) {
      console.log('⚠️ intro_video_id column already exists')
    } else {
      console.error('Error adding intro video support:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

addIntroVideoSupport()