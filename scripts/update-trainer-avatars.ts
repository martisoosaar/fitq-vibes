import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const trainerAvatarMap: Record<string, string> = {
  'kalev-ermits': '/images/trainers/kalev-ermits.png',
  'katrena': '/images/trainers/katrena-tenno.png',
  'kristimoldri': '/images/trainers/kristi-moldri.png',
  'meeli': '/images/trainers/meeli-kask.png',
  'kaili-kuusik': '/images/trainers/kaili-kuusik.png',
  'melissamand': '/images/trainers/melissa-mand.png',
  'kirsti-kuhi': '/images/trainers/kirsti-kuhi.png',
  'joogalauraga': '/images/trainers/laura-kuklase.png',
  'kaisatorn': '/images/trainers/kaisa-torn.png',
  'hedi-kuhlap': '/images/trainers/hedi-kuhlap.png',
  'smarek': '/images/trainers/marek-skorohhodov.png',
  'martisoosaar': '/images/trainers/avatar.png', // Default avatar for now
  'krete-junson': '/images/trainers/krete-junson.png',
}

async function main() {
  console.log('Updating trainer avatars...')

  for (const [slug, avatar] of Object.entries(trainerAvatarMap)) {
    try {
      const trainer = await prisma.trainer.findFirst({
        where: { 
          slug: { contains: slug }
        }
      })

      if (trainer) {
        await prisma.trainer.update({
          where: { id: trainer.id },
          data: { avatar }
        })
        console.log(`Updated avatar for ${trainer.name} (${slug})`)
      }
    } catch (error) {
      console.error(`Failed to update ${slug}:`, error)
    }
  }

  // Set default avatar for trainers without specific images
  await prisma.trainer.updateMany({
    where: {
      OR: [
        { avatar: null },
        { avatar: 'users/default.png' }
      ]
    },
    data: {
      avatar: '/images/trainers/avatar.png'
    }
  })

  console.log('Avatar update completed!')
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Failed to update avatars:', e)
    process.exit(1)
  })