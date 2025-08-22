import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all users who are trainers
  const trainers = await prisma.user.findMany({
    where: {
      trainerUnlocked: 1
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      simpleLink: true,
      totalVideoViews: true
    }
  })

  console.log(`Found ${trainers.length} trainers to create`)

  // Clear existing trainers
  await prisma.trainer.deleteMany()
  console.log('Cleared existing trainers')

  // Create trainer records
  for (const user of trainers) {
    const slug = user.simpleLink || 
                 user.name?.toLowerCase()
                   .replace(/\s+/g, '-')
                   .replace(/[^a-z0-9-]/g, '') ||
                 `trainer-${user.id}`

    try {
      await prisma.trainer.create({
        data: {
          id: user.id, // Use same ID as user
          slug: slug,
          name: user.name || user.email.split('@')[0],
          avatar: user.avatar,
          videosCount: 0, // Will be updated later
          videoViews: user.totalVideoViews || 0
        }
      })
      console.log(`Created trainer: ${user.name} (${slug})`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Duplicate slug, add number
        const uniqueSlug = `${slug}-${user.id}`
        await prisma.trainer.create({
          data: {
            id: user.id,
            slug: uniqueSlug,
            name: user.name || user.email.split('@')[0],
            avatar: user.avatar,
            videosCount: 0,
            videoViews: user.totalVideoViews || 0
          }
        })
        console.log(`Created trainer with unique slug: ${user.name} (${uniqueSlug})`)
      } else {
        console.error(`Failed to create trainer ${user.name}:`, error)
      }
    }
  }

  console.log('Trainers created successfully!')
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Failed to create trainers:', e)
    process.exit(1)
  })