import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  // Trainers
  const trainers = [];
  for (let i = 0; i < 8; i++) {
    const t = await prisma.trainer.create({ data: {
      slug: `treener-${i+1}`,
      name: `Treener ${i+1}`,
      avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      videosCount: 10 + (i % 7),
      videoViews: 1000 + i * 111,
    }});
    trainers.push(t);
  }

  // Videos
  const categories = ['jooga', 'HIIT', 'jõud'];
  for (let i = 0; i < 24; i++) {
    await prisma.video.create({ data: {
      title: `Treeningvideo ${i+1}`,
      duration: 20*60 + (i%10)*15,
      image: `https://picsum.photos/seed/fitqv-${i}/640/360`,
      category: rand(categories),
      trainerId: trainers[i % trainers.length].id,
    }});
  }

  // Programs
  for (let i = 0; i < 9; i++) {
    await prisma.program.create({ data: {
      hashId: `ph${i+1}`,
      title: `Programm ${i+1}`,
      shortDescription: 'Lühikirjeldus — sobib algajale, vastupidavus ja tugevus',
      picture: `https://picsum.photos/seed/fitqp-${i}/600/400`,
      urlSlug: `programm-${i+1}`,
      trainerId: trainers[i % trainers.length].id,
      unitsCount: 12,
      canAccess: i % 3 !== 0,
    }});
  }
}

main().then(()=>{
  console.log('Seed done');
  return prisma.$disconnect();
}).catch(async (e)=>{
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

