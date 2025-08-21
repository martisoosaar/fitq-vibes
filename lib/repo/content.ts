import { prisma } from '@/lib/db';

export async function listVideos(page = 1, perPage = 9) {
  const total = await prisma.video.count();
  const videos = await prisma.video.findMany({
    orderBy: { id: 'asc' },
    skip: (page - 1) * perPage,
    take: perPage,
  });
  const pages = Math.ceil(total / perPage);
  return { videos, page, pages };
}

export async function listTrainers() {
  const trainers = await prisma.trainer.findMany({ orderBy: { id: 'asc' }, take: 100 });
  return { trainers, nextOffset: null, sorted: 'default' };
}

export async function listPrograms() {
  const programs = await prisma.program.findMany({ include: { trainer: { select: { name: true, slug: true } } }, orderBy: { id: 'asc' }, take: 100 });
  return { programs };
}

export async function getVideo(id: number) {
  return prisma.video.findUnique({ where: { id } });
}

export async function getTrainerBySlug(slug: string) {
  return prisma.trainer.findUnique({ where: { slug } });
}

export async function getProgramBySlug(slug: string) {
  return prisma.program.findUnique({ where: { urlSlug: slug }, include: { trainer: { select: { name: true, slug: true } } } });
}
