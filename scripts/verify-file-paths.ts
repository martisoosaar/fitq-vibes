import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFilePaths() {
  try {
    const files = await prisma.trainerProgramUnitFile.findMany({
      where: {
        unitId: BigInt(1288)
      }
    });
    
    console.log('Files for unit 1288:');
    files.forEach(file => {
      console.log(`- ID: ${file.id}`);
      console.log(`  Title: ${file.title}`);
      console.log(`  Path: ${file.file}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFilePaths();