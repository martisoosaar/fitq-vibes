import mysql from 'mysql2/promise'

async function main() {
  // Connect to legacy database
  const legacyConnection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'M1nupar007',
    database: 'fitq_legacy'
  })

  const newConnection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'M1nupar007',
    database: 'fitqvibes'
  })

  // Count users in legacy
  const [legacyCount] = await legacyConnection.execute(
    "SELECT COUNT(*) as count FROM users WHERE email IS NOT NULL AND email != ''"
  ) as any[]
  
  // Count users in new
  const [newCount] = await newConnection.execute(
    "SELECT COUNT(*) as count FROM User"
  ) as any[]
  
  // Get max ID in legacy
  const [maxLegacy] = await legacyConnection.execute(
    "SELECT MAX(id) as maxId FROM users"
  ) as any[]
  
  // Get max ID in new
  const [maxNew] = await newConnection.execute(
    "SELECT MAX(id) as maxId FROM User"
  ) as any[]
  
  // Get newest users in legacy
  const [newestLegacy] = await legacyConnection.execute(
    "SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5"
  ) as any[]
  
  // Get newest migrated user
  const [newestMigrated] = await newConnection.execute(
    "SELECT id, email, name, createdAt FROM User WHERE id > 1000 ORDER BY id DESC LIMIT 5"
  ) as any[]

  console.log('=== KASUTAJATE STATISTIKA ===')
  console.log(`Vanas andmebaasis: ${legacyCount[0].count} kasutajat`)
  console.log(`Uues andmebaasis: ${newCount[0].count} kasutajat`)
  console.log(`Max ID vanas: ${maxLegacy[0].maxId}`)
  console.log(`Max ID uues: ${maxNew[0].maxId}`)
  console.log('\n=== UUSIMAD KASUTAJAD VANAS BAASIS ===')
  newestLegacy.forEach((u: any) => {
    console.log(`ID ${u.id}: ${u.name || 'No name'} (${u.email}) - ${new Date(u.created_at).toLocaleDateString()}`)
  })
  console.log('\n=== VIIMASED MIGEERITUD KASUTAJAD ===')
  newestMigrated.forEach((u: any) => {
    console.log(`ID ${u.id}: ${u.name || 'No name'} (${u.email})`)
  })

  await legacyConnection.end()
  await newConnection.end()
}

main().catch(console.error)