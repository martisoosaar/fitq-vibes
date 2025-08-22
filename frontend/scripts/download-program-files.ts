import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import https from 'https';

const prisma = new PrismaClient();

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function sanitizeFilename(filename: string): string {
  // Remove special characters and keep only safe ones
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100); // Limit filename length
}

async function downloadProgramFiles() {
  try {
    // Get all files from database
    const files = await prisma.trainerProgramUnitFile.findMany({
      where: {
        deletedAt: null,
        file: {
          startsWith: 'https://'
        }
      }
    });
    
    console.log(`Found ${files.length} files to download`);
    
    const baseDir = path.join(process.cwd(), 'public', 'program-files');
    
    for (const file of files) {
      try {
        // Extract original filename from URL or use title
        const urlParts = file.file.split('/');
        const originalName = urlParts[urlParts.length - 1];
        
        // Clean up the filename - decode URL encoding and remove prefixes
        let cleanName = decodeURIComponent(originalName);
        
        // Remove the random prefix if it exists (e.g., "GYqXNWcwq_")
        if (cleanName.includes('_')) {
          const parts = cleanName.split('_');
          if (parts[0].length === 9) { // Random prefix is usually 9 chars
            cleanName = parts.slice(1).join('_');
          }
        }
        
        // Use title if available and looks better
        if (file.title && file.title !== 'NULL' && !file.title.includes('.png') && !file.title.includes('.jpg')) {
          cleanName = file.title;
          // Add extension if not present
          if (!cleanName.includes('.')) {
            const ext = originalName.split('.').pop();
            if (ext && ext.length <= 4) {
              cleanName += '.' + ext;
            }
          }
        }
        
        // Create safe filename
        const safeFilename = `${file.id}_${sanitizeFilename(cleanName)}`;
        const localPath = path.join(baseDir, safeFilename);
        const publicPath = `/program-files/${safeFilename}`;
        
        // Check if file already exists
        if (fs.existsSync(localPath)) {
          console.log(`File already exists: ${safeFilename}`);
          
          // Update database with local path
          await prisma.trainerProgramUnitFile.update({
            where: { id: file.id },
            data: { file: publicPath }
          });
          continue;
        }
        
        console.log(`Downloading: ${file.title || cleanName}...`);
        
        // Download the file
        await downloadFile(file.file, localPath);
        
        // Update database with local path
        await prisma.trainerProgramUnitFile.update({
          where: { id: file.id },
          data: { file: publicPath }
        });
        
        console.log(`✓ Downloaded and updated: ${safeFilename}`);
        
      } catch (error) {
        console.error(`Error processing file ${file.id}:`, error.message);
      }
    }
    
    // Verify the downloads
    console.log('\nVerifying downloaded files:');
    const updatedFiles = await prisma.trainerProgramUnitFile.findMany({
      where: {
        unitId: BigInt(1288)
      }
    });
    
    updatedFiles.forEach(file => {
      const localPath = path.join(process.cwd(), 'public', file.file);
      const exists = file.file.startsWith('/program-files/') ? fs.existsSync(localPath) : false;
      console.log(`- ${file.title}: ${exists ? '✓ Available locally' : 'Remote URL'}`);
    });
    
    console.log('\nFiles downloaded successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

downloadProgramFiles();