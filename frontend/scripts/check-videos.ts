import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVideos() {
  try {
    // Check intro videos
    const programsWithIntro = await prisma.trainerProgram.count({
      where: { introVideoId: { not: null } }
    })
    console.log('Programs with intro videos:', programsWithIntro)
    
    // Check video materials
    const vmCount = await prisma.trainerProgramUnitVideoMaterial.count()
    console.log('Total video materials:', vmCount)
    
    // Check video tasks
    const vtCount = await prisma.trainerProgramUnitVideoTask.count()
    console.log('Total video tasks:', vtCount)
    
    // Check if we have any videos at all
    const videoCount = await prisma.video.count()
    console.log('Total videos in database:', videoCount)
    
    // Let's check specific program
    const program = await prisma.trainerProgram.findFirst({
      where: { urlSlug: 'motivatsioon' }
    })
    
    if (program) {
      console.log('\nProgram "motivatsioon":')
      console.log('- ID:', program.id.toString())
      console.log('- Intro video ID:', program.introVideoId)
      
      // Check units for this program
      const units = await prisma.trainerProgramUnit.findMany({
        where: { programId: program.id },
        include: {
          _count: {
            select: {
              videoMaterials: true,
              videoTasks: true
            }
          }
        }
      })
      
      console.log('\nUnits with videos:')
      for (const unit of units) {
        if (unit._count.videoMaterials > 0 || unit._count.videoTasks > 0) {
          console.log(`- Unit "${unit.title}": ${unit._count.videoMaterials} materials, ${unit._count.videoTasks} tasks`)
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideos()