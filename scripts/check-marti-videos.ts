import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMartiVideos() {
  // Get Marti's user
  const user = await prisma.user.findFirst({
    where: { email: 'marti@fitq.studio' }
  })
  
  if (!user) {
    console.log('User not found')
    return
  }
  
  console.log('User:', user.name, '(ID:', user.id, ')')
  
  // Check if Marti has a trainer record
  const trainer = await prisma.trainer.findFirst({
    where: { userId: user.id }
  })
  
  if (trainer) {
    console.log('Has trainer record: Yes (Trainer ID:', trainer.id, ')')
    
    // Check videos where Marti is the main trainer
    const ownedVideos = await prisma.video.count({
      where: { trainerId: trainer.id }
    })
    console.log('Videos as main trainer:', ownedVideos)
    
    // Check videos where Marti is co-trainer
    const coTrainerVideos = await prisma.videoTrainer.count({
      where: { trainerId: trainer.id }
    })
    console.log('Videos as co-trainer:', coTrainerVideos)
    
  } else {
    console.log('Has trainer record: No')
    
    // Check if any videos are linked directly to user ID
    const videosWithUserId = await prisma.video.count({
      where: { trainerId: user.id }
    })
    console.log('Videos with user ID as trainer ID:', videosWithUserId)
  }
  
  // Check total videos in database
  const totalVideos = await prisma.video.count()
  console.log('\nTotal videos in database:', totalVideos)
  
  // Check some sample videos to see trainer IDs
  const sampleVideos = await prisma.video.findMany({
    take: 5,
    where: {
      trainerId: { not: null }
    },
    select: {
      id: true,
      title: true,
      trainerId: true
    }
  })
  
  console.log('\nSample videos with trainer IDs:')
  for (const v of sampleVideos) {
    console.log('  -', v.title, '(trainer ID:', v.trainerId, ')')
  }
  
  await prisma.$disconnect()
}

checkMartiVideos()