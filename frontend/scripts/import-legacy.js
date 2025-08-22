import 'dotenv/config';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseUrl(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port) || 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ''),
    };
  } catch {
    return null;
  }
}

async function run() {
  let cfg = null;
  const legacyUrl = process.env.LEGACY_DATABASE_URL;
  if (legacyUrl) {
    cfg = parseUrl(legacyUrl);
    if (!cfg) throw new Error('LEGACY_DATABASE_URL invalid');
  } else {
    const host = process.env.LEGACY_DB_HOST;
    const port = Number(process.env.LEGACY_DB_PORT || '3306');
    const user = process.env.LEGACY_DB_USER;
    const password = process.env.LEGACY_DB_PASSWORD;
    const database = process.env.LEGACY_DB_NAME;
    if (!host || !user || !password || !database) throw new Error('Legacy DB env missing. Provide LEGACY_DATABASE_URL or LEGACY_DB_* vars.');
    cfg = { host, port, user, password, database };
  }

  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    multipleStatements: false,
  });

  console.log('Connected legacy DB, starting import...');

  // Treenerid (users tabelist): kuvame nimekirjas kui display_on_trainers_list=1 või esinevad video_trainers tabelis
  let [rows] = await conn.execute(
    `SELECT u.id, u.simple_link AS slug, u.name, u.avatar, u.total_video_views
     FROM users u
     WHERE u.display_on_trainers_list=1
        OR u.id IN (SELECT DISTINCT vt.trainer_id FROM video_trainers vt)`
  ).catch(async (e)=>{
    console.warn('Trainers query failed, adjust columns/table names:', e.message);
    return [ [] ];
  });
  let trainersImported = 0;
  for (const r of rows) {
    await prisma.trainer.upsert({
      where: { slug: r.slug || `trainer-${r.id}` },
      create: {
        slug: r.slug || `trainer-${r.id}`,
        name: r.name || 'Treener',
        avatar: r.avatar || null,
        videosCount: 0,
        videoViews: r.total_video_views || 0,
      },
      update: {
        name: r.name || 'Treener',
        avatar: r.avatar || null,
        videoViews: r.total_video_views || 0,
      }
    });
    trainersImported++;
  }
  console.log(`Imported trainers: ${trainersImported}`);

  // Videod
  ;[rows] = await conn.execute(
    `SELECT v.id, v.title, v.duration, COALESCE(v.video_preview, v.video_preview_external, '') AS image,
            vc.name AS category,
            (SELECT vt.trainer_id FROM video_trainers vt WHERE vt.video_id=v.id AND vt.deleted_at IS NULL LIMIT 1) AS trainer_id
     FROM videos v
     LEFT JOIN video_categories vc ON vc.id=v.category
     WHERE v.hidden=0 AND v.video_deleted=0
     LIMIT 3000`
  ).catch(async (e)=>{
    console.warn('Videos query failed, adjust columns/table names:', e.message);
    return [ [] ];
  });
  let videosImported = 0;
  for (const v of rows) {
    let trainer = null;
    if (v.trainer_id) {
      // We referenced trainer by legacy numeric id; our prisma.trainer uses slug unique; find any trainer by slug starting trainer-<id>
      trainer = await prisma.trainer.findFirst({ where: { slug: `trainer-${Number(v.trainer_id)}` } });
    }
    await prisma.video.create({
      data: {
        title: v.title || 'Video',
        duration: Number(v.duration) || 0,
        image: v.image || '',
        category: v.category || 'muu',
        trainerId: trainer?.id || null,
      }
    }).catch(async()=>{
      await prisma.video.update({
        where: { id: Number(v.id) },
        data: {
          title: v.title || 'Video',
          duration: Number(v.duration) || 0,
          image: v.image || '',
          category: v.category || 'muu',
          trainerId: trainer?.id || null,
        }
      }).catch(()=>{});
    });
    videosImported++;
  }
  console.log(`Imported videos: ${videosImported}`);

  // Programmid
  ;[rows] = await conn.execute(
    `SELECT tp.id, tp.title, tp.short_description, tp.picture, tp.url_slug, tp.trainer_id,
            (SELECT COUNT(*) FROM trainer_program_units u WHERE u.program_id=tp.id) AS units_count,
            tp.status
     FROM trainer_programs tp
     WHERE tp.deleted_at IS NULL
     LIMIT 1000`
  ).catch(async (e)=>{
    console.warn('Programs query failed, adjust columns/table names:', e.message);
    return [ [] ];
  });
  let programsImported = 0;
  for (const p of rows) {
    const trainerLegacyId = p.trainer_id ? Number(p.trainer_id) : null;
    let trainerId = (await prisma.trainer.findFirst({ select: { id: true }, where: { slug: `trainer-${trainerLegacyId}` } }))?.id;
    if (!trainerId) trainerId = (await prisma.trainer.findFirst({ select: { id: true } }))?.id; // fallback
    await prisma.program.upsert({
      where: { hashId: `ph${p.id}` },
      create: {
        hashId: `ph${p.id}`,
        title: p.title || 'Programm',
        shortDescription: p.short_description || '',
        picture: p.picture || '',
        urlSlug: p.url_slug || `program-${p.id}`,
        trainerId: trainerId!,
        unitsCount: Number(p.units_count) || 0,
        canAccess: p.status && p.status.toUpperCase() !== 'DRAFT',
      },
      update: {
        title: p.title || 'Programm',
        shortDescription: p.short_description || '',
        picture: p.picture || '',
        urlSlug: p.url_slug || `program-${p.id}`,
        trainerId: trainerId!,
        unitsCount: Number(p.units_count) || 0,
        canAccess: p.status && p.status.toUpperCase() !== 'DRAFT',
      }
    });
    programsImported++;
  }
  console.log(`Imported programs: ${programsImported}`);

  await conn.end();
  await prisma.$disconnect();
  console.log('Import complete.');
}

run().catch(async (e)=>{
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
