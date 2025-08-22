import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFiles() {
  try {
    // Check files for unit 1288
    const files = await prisma.trainerProgramUnitFile.findMany({
      where: {
        unitId: BigInt(1288)
      }
    });
    
    console.log('Files for unit 1288:', files);
    
    // Check all files
    const allFiles = await prisma.trainerProgramUnitFile.findMany({
      take: 20
    });
    
    console.log('\nAll files (first 20):');
    allFiles.forEach(file => {
      console.log(`ID: ${file.id}, Unit: ${file.unitId}, Title: ${file.title}, File: ${file.file}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFiles();