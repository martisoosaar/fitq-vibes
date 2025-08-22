import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const countBefore = await prisma.users.count({ where: { trainer_unlocked: true, display_on_trainers_list: true } })
  const missing = await prisma.users.findMany({
    where: {
      trainer_unlocked: true,
      display_on_trainers_list: false
    },
    select: { id: true, email: true, name: true }
  })

  for (const u of missing) {
    await prisma.users.update({ where: { id: u.id }, data: { display_on_trainers_list: true } })
    console.log(`✓ Enabled display_on_trainers_list for ${u.email || u.name} (${u.id})`)
  }

  const countAfter = await prisma.users.count({ where: { trainer_unlocked: true, display_on_trainers_list: true } })
  console.log(`Before: ${countBefore}, After: ${countAfter}, Changed: ${missing.length}`)
}

main().finally(async () => prisma.$disconnect())
