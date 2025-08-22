import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const socialLinks = [
  { userId: 3, facebook: 'facebook' },
  { userId: 2489, facebook: 'https://www.facebook.com/Treener-Evelin-Talts-214175145982115', youtube: 'https://www.youtube.com/results?search_query=evelin+talts', instagram: 'https://www.instagram.com/evelintalts/' },
  { userId: 73, facebook: 'https://fb.me/martisoosaar', instagram: 'https://instagram.com/martisoosaar', twitter: 'https://twitter.com/MartiSoosaar' },
  { userId: 1797, facebook: 'https://www.facebook.com/jarmokullfit', instagram: 'https://www.instagram.com/jarmokullfit' },
  { userId: 35, facebook: 'https://m.facebook.com/katrena.tenno', instagram: 'https://www.instagram.com/katrenat/?hl=en' },
  { userId: 201, facebook: 'https://www.facebook.com/profile.php?id=100009428702210', instagram: 'https://www.instagram.com/hendrik_kont/?hl=en' },
  { userId: 126, facebook: 'https://www.facebook.com/DancewithKristi', youtube: 'https://www.youtube.com/kristimoldri', instagram: 'https://www.instagram.com/kristimoldri', tiktok: 'https://vm.tiktok.com/kristimoldri', twitter: 'https://www.twitter.com/kristimoldri' },
  { userId: 1393, facebook: 'https://www.facebook.com/meeli.kask', instagram: 'https://www.instagram.com/meelikask/' },
  { userId: 21, facebook: 'https://www.facebook.com/PersonaaltreenerMailiisStolts', youtube: 'https://www.youtube.com/channel/UCmbSa8DKUgCkSISiRWhuZTg', instagram: 'https://www.instagram.com/mailiisstolts/' },
  { userId: 3009, instagram: 'https://www.instagram.com/smarektln' },
  { userId: 218, facebook: 'https://m.facebook.com/karinaaltt', instagram: 'https://www.instagram.com/karinaalt/' },
  { userId: 3344, facebook: 'Aina trennid' },
  { userId: 3429, facebook: 'https://www.facebook.com/stebby', instagram: 'https://www.instagram.com/stebby.eesti' },
  { userId: 120, facebook: 'https://www.facebook.com/pillepilates', instagram: 'https://www.instagram.com/pilletrolla/?hl=en' },
  { userId: 3947, facebook: 'https://www.facebook.com/celebratelifebylaura', youtube: 'https://www.youtube.com/channel/UCrfbyKtZR7YC0mbAcQym22Q', instagram: 'https://www.instagram.com/celebratelifebylaura/' },
  { userId: 3989, facebook: 'https://www.facebook.com/personaaltreenermelissa', youtube: 'https://www.youtube.com/user/yauzza/', instagram: 'https://www.instagram.com/melissamand/' },
  { userId: 153, instagram: 'https://www.instagram.com/kalevermits/' },
  { userId: 4381, instagram: 'https://www.instagram.com/seva.ltu/?hl=en' },
  { userId: 4442, facebook: 'https://www.facebook.com/ksenikini', instagram: 'https://www.instagram.com/ksenikini/' },
]

async function importSocialLinks() {
  console.log('Starting social links import...')
  
  for (const link of socialLinks) {
    try {
      // Check if trainer exists
      const trainer = await prisma.trainer.findUnique({
        where: { id: link.userId }
      })
      
      if (!trainer) {
        console.log(`Trainer ${link.userId} not found, skipping...`)
        continue
      }
      
      // Create or update social links
      await prisma.trainerSocialLink.upsert({
        where: { userId: link.userId },
        update: {
          facebookLink: link.facebook || null,
          youtubeLink: link.youtube || null,
          instagramLink: link.instagram || null,
          tiktokLink: link.tiktok || null,
          twitterLink: link.twitter || null,
        },
        create: {
          userId: link.userId,
          facebookLink: link.facebook || null,
          youtubeLink: link.youtube || null,
          instagramLink: link.instagram || null,
          tiktokLink: link.tiktok || null,
          twitterLink: link.twitter || null,
        }
      })
      
      console.log(`✓ Imported social links for trainer ${link.userId}`)
    } catch (error) {
      console.error(`Failed to import social links for trainer ${link.userId}:`, error)
    }
  }
  
  console.log('Social links import completed!')
  await prisma.$disconnect()
}

importSocialLinks().catch(console.error)