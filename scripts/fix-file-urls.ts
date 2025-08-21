import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function fixFileUrls() {
  try {
    console.log('Reading SQL dump for file URLs...');
    const sqlContent = fs.readFileSync('/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql', 'utf8');
    
    // Extract file data from SQL dump
    const fileDataMatch = sqlContent.match(/INSERT INTO `trainer_program_unit_files`.*?VALUES\s*\((.*?)\);/s);
    if (!fileDataMatch) {
      console.log('Could not find file data in SQL dump');
      return;
    }
    
    // Parse the file entries
    const fileEntries: any[] = [];
    const regex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*(?:'([^']*)'|NULL),\s*'([^']+)',\s*'([^']+)',\s*(?:'([^']+)'|NULL)\)/g;
    let match;
    
    while ((match = regex.exec(fileDataMatch[1])) !== null) {
      fileEntries.push({
        id: BigInt(match[1]),
        unitId: BigInt(match[2]),
        fileUrl: match[3],
        title: match[4] || match[3].split('/').pop(),
        createdAt: match[5],
        updatedAt: match[6],
        deletedAt: match[7] || null
      });
    }
    
    console.log(`Found ${fileEntries.length} file entries to fix`);
    
    // Update each file with correct URL
    for (const entry of fileEntries) {
      if (entry.deletedAt) continue; // Skip deleted files
      
      try {
        await prisma.trainerProgramUnitFile.upsert({
          where: { id: entry.id },
          update: {
            file: entry.fileUrl,
            title: entry.title || 'Untitled'
          },
          create: {
            id: entry.id,
            unitId: entry.unitId,
            file: entry.fileUrl,
            title: entry.title || 'Untitled',
            order: null,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt),
            deletedAt: entry.deletedAt ? new Date(entry.deletedAt) : null
          }
        });
        console.log(`Fixed file ${entry.id}: ${entry.title}`);
      } catch (err) {
        console.error(`Error fixing file ${entry.id}:`, err.message);
      }
    }
    
    // Verify the fix
    console.log('\nVerifying fixed files for unit 1288:');
    const files = await prisma.trainerProgramUnitFile.findMany({
      where: {
        unitId: BigInt(1288)
      }
    });
    
    files.forEach(file => {
      console.log(`- ${file.title}: ${file.file.substring(0, 80)}...`);
    });
    
    console.log('\nFile URLs fixed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFileUrls();