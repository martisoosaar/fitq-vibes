import 'dotenv/config';
import mysql from 'mysql2/promise';

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

async function main() {
  let cfg = null;
  if (process.env.LEGACY_DATABASE_URL) {
    cfg = parseUrl(process.env.LEGACY_DATABASE_URL);
  } else {
    cfg = {
      host: process.env.LEGACY_DB_HOST,
      port: Number(process.env.LEGACY_DB_PORT || '3306'),
      user: process.env.LEGACY_DB_USER,
      password: process.env.LEGACY_DB_PASSWORD,
      database: process.env.LEGACY_DB_NAME,
    };
  }
  if (!cfg || !cfg.host) throw new Error('Legacy DB configuration missing');

  const conn = await mysql.createConnection(cfg);
  const [tables] = await conn.execute('SHOW TABLES');
  console.log('Tables:', tables.map((t) => Object.values(t)[0]));

  // Inspect common tables if exist
  const candidates = ['videos', 'trainers', 'programs'];
  for (const name of candidates) {
    try {
      const [cols] = await conn.execute(`DESCRIBE \`${name}\``);
      console.log(`\nSchema for ${name}:`);
      console.table(cols);
      const [sample] = await conn.execute(`SELECT * FROM \`${name}\` LIMIT 3`);
      console.log(`Sample rows for ${name}:`, sample);
    } catch (e) {
      console.log(`Table ${name} not found or not accessible.`);
    }
  }

  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

