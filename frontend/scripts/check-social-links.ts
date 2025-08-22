import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSocialLinks() {
  console.log('Checking social links for Kristi Möldri (ID: 126)...\n')
  
  // Check trainer exists
  const trainer = await prisma.trainer.findUnique({
    where: { id: 126 }
  })
  
  console.log('Trainer found:', trainer ? `${trainer.name} (${trainer.slug})` : 'NOT FOUND')
  
  // Check social links
  const socialLinks = await prisma.trainerSocialLink.findUnique({
    where: { userId: 126 }
  })
  
  if (socialLinks) {
    console.log('\nSocial links found:')
    console.log('- Facebook:', socialLinks.facebookLink || 'none')
    console.log('- Instagram:', socialLinks.instagramLink || 'none')
    console.log('- YouTube:', socialLinks.youtubeLink || 'none')
    console.log('- TikTok:', socialLinks.tiktokLink || 'none')
    console.log('- Twitter:', socialLinks.twitterLink || 'none')
  } else {
    console.log('\nNO SOCIAL LINKS FOUND!')
  }
  
  await prisma.$disconnect()
}

checkSocialLinks().catch(console.error)