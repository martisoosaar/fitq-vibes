#!/usr/bin/env node
/**
 * Sync Program Files Script
 * 
 * This script downloads any program files that are still hosted externally
 * and saves them locally in the public/program-files directory.
 * 
 * Run with: npm run sync:files
 * or: npx tsx scripts/sync-program-files.ts
 */

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
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
}

async function syncProgramFiles() {
  try {
    console.log('🔍 Checking for external program files...\n');
    
    // Get all files that are still hosted externally
    const externalFiles = await prisma.trainerProgramUnitFile.findMany({
      where: {
        deletedAt: null,
        file: {
          startsWith: 'https://'
        }
      }
    });
    
    if (externalFiles.length === 0) {
      console.log('✅ All files are already hosted locally!');
      return;
    }
    
    console.log(`Found ${externalFiles.length} external files to download\n`);
    
    const baseDir = path.join(process.cwd(), 'public', 'program-files');
    
    // Ensure directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      console.log(`📁 Created directory: ${baseDir}\n`);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of externalFiles) {
      try {
        const urlParts = file.file.split('/');
        const originalName = urlParts[urlParts.length - 1];
        let cleanName = decodeURIComponent(originalName);
        
        // Remove random prefix if exists
        if (cleanName.includes('_')) {
          const parts = cleanName.split('_');
          if (parts[0].length === 9) {
            cleanName = parts.slice(1).join('_');
          }
        }
        
        // Use title if available
        if (file.title && file.title !== 'NULL' && !file.title.includes('.png') && !file.title.includes('.jpg')) {
          cleanName = file.title;
          if (!cleanName.includes('.')) {
            const ext = originalName.split('.').pop();
            if (ext && ext.length <= 4) {
              cleanName += '.' + ext;
            }
          }
        }
        
        const safeFilename = `${file.id}_${sanitizeFilename(cleanName)}`;
        const localPath = path.join(baseDir, safeFilename);
        const publicPath = `/program-files/${safeFilename}`;
        
        console.log(`📥 Downloading: ${file.title || cleanName}`);
        console.log(`   From: ${file.file.substring(0, 60)}...`);
        console.log(`   To: ${publicPath}`);
        
        await downloadFile(file.file, localPath);
        
        // Update database with local path
        await prisma.trainerProgramUnitFile.update({
          where: { id: file.id },
          data: { file: publicPath }
        });
        
        console.log(`   ✅ Success!\n`);
        successCount++;
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }
    
    console.log('━'.repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully downloaded: ${successCount} files`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed: ${errorCount} files`);
    }
    
    // Show current status
    const allFiles = await prisma.trainerProgramUnitFile.count({
      where: { deletedAt: null }
    });
    
    const localFiles = await prisma.trainerProgramUnitFile.count({
      where: {
        deletedAt: null,
        file: {
          startsWith: '/program-files/'
        }
      }
    });
    
    console.log(`\n📁 File Storage Status:`);
    console.log(`   Total files: ${allFiles}`);
    console.log(`   Local files: ${localFiles}`);
    console.log(`   External files: ${allFiles - localFiles}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncProgramFiles().catch(console.error);