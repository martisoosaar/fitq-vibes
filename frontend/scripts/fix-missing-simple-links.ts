import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const missing = await prisma.users.findMany({
    where: { trainer_unlocked: true, simple_link: null },
    select: { id: true, name: true, email: true }
  })
  let updated = 0
  for (const u of missing) {
    const base = u.name || (u.email?.split('@')[0] ?? String(u.id))
    let slug = slugify(base)
    if (!slug) slug = String(u.id)

    // ensure uniqueness
    let final = slug
    let suffix = 1
    while (await prisma.users.findFirst({ where: { simple_link: final, NOT: { id: u.id } }, select: { id: true } })) {
      final = `${slug}-${suffix++}`
    }

    await prisma.users.update({ where: { id: u.id }, data: { simple_link: final } })
    console.log(`✓ ${u.name || u.email} -> ${final}`)
    updated++
  }
  console.log(`Done. Updated ${updated} users with simple_link.`)
}

main().finally(async () => prisma.$disconnect())
