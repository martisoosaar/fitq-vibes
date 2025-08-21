import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Parse SQL dump to extract INSERT statements for specific tables
function extractTableData(sqlContent: string, tableName: string) {
  const regex = new RegExp(`INSERT INTO \`${tableName}\` .*?VALUES[\\s\\S]*?(?=;[\\s]*(?:INSERT|ALTER|CREATE|DROP|--|$))`, 'gi');
  const matches = sqlContent.match(regex) || [];
  const records: any[] = [];
  
  for (const match of matches) {
    // Extract values from INSERT statement
    const valuesRegex = /\((.*?)\)(?=,|\s*;)/gs;
    let valueMatch;
    while ((valueMatch = valuesRegex.exec(match)) !== null) {
      const values = valueMatch[1]
        .split(/,(?=(?:[^']*'[^']*')*[^']*$)/)
        .map(v => {
          v = v.trim();
          if (v === 'NULL') return null;
          if (v.startsWith("'") && v.endsWith("'")) {
            return v.slice(1, -1).replace(/''/g, "'").replace(/\\'/g, "'");
          }
          return v;
        });
      records.push(values);
    }
  }
  
  return records;
}

async function importProgramTasks() {
  try {
    console.log('Reading SQL dump...');
    const sqlContent = fs.readFileSync('/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql', 'utf8');
    
    // Import text tasks
    console.log('Extracting text tasks...');
    const textTasks = extractTableData(sqlContent, 'trainer_program_unit_text_tasks');
    console.log(`Found ${textTasks.length} text tasks`);
    
    let importedCount = 0;
    for (const task of textTasks) {
      try {
        await prisma.trainerProgramUnitTextTask.create({
          data: {
            id: BigInt(task[0]),
            unitId: BigInt(task[1]),
            order: task[2] ? parseInt(task[2]) : null,
            title: task[3] || '',
            description: task[4],
            createdAt: task[5] ? new Date(task[5]) : null,
            updatedAt: task[6] ? new Date(task[6]) : null,
            deletedAt: task[7] ? new Date(task[7]) : null
          }
        });
        importedCount++;
      } catch (err: any) {
        if (!err.message.includes('Unique constraint')) {
          console.error(`Error importing text task ${task[0]}: ${err.message}`);
        }
      }
    }
    console.log(`Imported ${importedCount} text tasks`);

    // Import video tasks
    console.log('Extracting video tasks...');
    const videoTasks = extractTableData(sqlContent, 'trainer_program_unit_video_tasks');
    console.log(`Found ${videoTasks.length} video tasks`);
    
    importedCount = 0;
    for (const task of videoTasks) {
      try {
        await prisma.trainerProgramUnitVideoTask.create({
          data: {
            id: BigInt(task[0]),
            unitId: BigInt(task[1]),
            videoId: parseInt(task[2]),
            order: task[3] ? parseInt(task[3]) : null,
            createdAt: task[4] ? new Date(task[4]) : null,
            updatedAt: task[5] ? new Date(task[5]) : null,
            deletedAt: task[6] ? new Date(task[6]) : null
          }
        });
        importedCount++;
      } catch (err: any) {
        if (!err.message.includes('Unique constraint')) {
          console.error(`Error importing video task ${task[0]}: ${err.message}`);
        }
      }
    }
    console.log(`Imported ${importedCount} video tasks`);

    // Import files
    console.log('Extracting files...');
    const files = extractTableData(sqlContent, 'trainer_program_unit_files');
    console.log(`Found ${files.length} files`);
    
    importedCount = 0;
    for (const file of files) {
      try {
        await prisma.trainerProgramUnitFile.create({
          data: {
            id: BigInt(file[0]),
            unitId: BigInt(file[1]),
            order: file[2] ? parseInt(file[2]) : null,
            title: file[3] || '',
            file: file[4] || '',
            createdAt: file[5] ? new Date(file[5]) : null,
            updatedAt: file[6] ? new Date(file[6]) : null,
            deletedAt: file[7] ? new Date(file[7]) : null
          }
        });
        importedCount++;
      } catch (err: any) {
        if (!err.message.includes('Unique constraint')) {
          console.error(`Error importing file ${file[0]}: ${err.message}`);
        }
      }
    }
    console.log(`Imported ${importedCount} files`);

    // Import workout template tasks
    console.log('Extracting workout template tasks...');
    const workoutTasks = extractTableData(sqlContent, 'trainer_program_unit_workout_template_tasks');
    console.log(`Found ${workoutTasks.length} workout template tasks`);
    
    importedCount = 0;
    for (const task of workoutTasks) {
      try {
        await prisma.trainerProgramUnitWorkoutTemplateTask.create({
          data: {
            id: BigInt(task[0]),
            unitId: BigInt(task[1]),
            order: task[2] ? parseInt(task[2]) : null,
            title: task[3] || '',
            workoutTemplateId: parseInt(task[4]),
            createdAt: task[5] ? new Date(task[5]) : null,
            updatedAt: task[6] ? new Date(task[6]) : null,
            deletedAt: task[7] ? new Date(task[7]) : null
          }
        });
        importedCount++;
      } catch (err: any) {
        if (!err.message.includes('Unique constraint')) {
          console.error(`Error importing workout task ${task[0]}: ${err.message}`);
        }
      }
    }
    console.log(`Imported ${importedCount} workout template tasks`);

    // Import cardio template tasks
    console.log('Extracting cardio template tasks...');
    const cardioTasks = extractTableData(sqlContent, 'trainer_program_unit_cardio_template_tasks');
    console.log(`Found ${cardioTasks.length} cardio template tasks`);
    
    importedCount = 0;
    for (const task of cardioTasks) {
      try {
        await prisma.trainerProgramUnitCardioTemplateTask.create({
          data: {
            id: BigInt(task[0]),
            unitId: BigInt(task[1]),
            order: task[2] ? parseInt(task[2]) : null,
            title: task[3] || '',
            cardioTemplateId: parseInt(task[4]),
            createdAt: task[5] ? new Date(task[5]) : null,
            updatedAt: task[6] ? new Date(task[6]) : null,
            deletedAt: task[7] ? new Date(task[7]) : null
          }
        });
        importedCount++;
      } catch (err: any) {
        if (!err.message.includes('Unique constraint')) {
          console.error(`Error importing cardio task ${task[0]}: ${err.message}`);
        }
      }
    }
    console.log(`Imported ${importedCount} cardio template tasks`);

    // Import program users
    console.log('Extracting program users...');
    const programUsers = extractTableData(sqlContent, 'trainer_program_users');
    console.log(`Found ${programUsers.length} program users`);
    
    importedCount = 0;
    for (const pUser of programUsers) {
      // Skip deleted users
      if (pUser[8]) continue; // deleted_at field
      
      try {
        await prisma.trainerProgramUser.create({
          data: {
            id: BigInt(pUser[0]),
            programId: BigInt(pUser[1]),
            userId: parseInt(pUser[2]),
            startDate: pUser[3] ? new Date(pUser[3]) : null,
            status: pUser[4] || 'ACTIVE',
            currentUnit: pUser[5] ? parseInt(pUser[5]) : null,
            createdAt: pUser[6] ? new Date(pUser[6]) : null,
            updatedAt: pUser[7] ? new Date(pUser[7]) : null,
            deletedAt: pUser[8] ? new Date(pUser[8]) : null
          }
        });
        importedCount++;
      } catch (err: any) {
        if (!err.message.includes('Unique constraint')) {
          console.error(`Error importing program user ${pUser[0]}: ${err.message}`);
        }
      }
    }
    console.log(`Imported ${importedCount} program users`);

    // Import user units done
    console.log('Extracting user units done...');
    const unitsDone = extractTableData(sqlContent, 'trainer_program_user_unit_done');
    console.log(`Found ${unitsDone.length} user units done`);
    
    importedCount = 0;
    for (const unit of unitsDone) {
      try {
        await prisma.trainerProgramUserUnitDone.create({
          data: {
            id: BigInt(unit[0]),
            programUserId: BigInt(unit[1]),
            unitId: BigInt(unit[2]),
            completedAt: unit[3] ? new Date(unit[3]) : null,
            createdAt: unit[4] ? new Date(unit[4]) : null,
            updatedAt: unit[5] ? new Date(unit[5]) : null
          }
        });
        importedCount++;
      } catch (err: any) {
        if (!err.message.includes('Unique constraint')) {
          console.error(`Error importing unit done ${unit[0]}: ${err.message}`);
        }
      }
    }
    console.log(`Imported ${importedCount} user units done`);

    // Import user tasks done
    console.log('Extracting user tasks done...');
    const tasksDone = extractTableData(sqlContent, 'trainer_program_user_tasks_done');
    console.log(`Found ${tasksDone.length} user tasks done`);
    
    importedCount = 0;
    for (const task of tasksDone) {
      try {
        await prisma.trainerProgramUserTaskDone.create({
          data: {
            id: BigInt(task[0]),
            programUserId: BigInt(task[1]),
            taskType: task[2],
            taskId: BigInt(task[3]),
            workoutId: task[4] ? parseInt(task[4]) : null,
            completedAt: task[5] ? new Date(task[5]) : null,
            createdAt: task[6] ? new Date(task[6]) : null,
            updatedAt: task[7] ? new Date(task[7]) : null
          }
        });
        importedCount++;
      } catch (err: any) {
        if (!err.message.includes('Unique constraint')) {
          console.error(`Error importing task done ${task[0]}: ${err.message}`);
        }
      }
    }
    console.log(`Imported ${importedCount} user tasks done`);

    console.log('Import complete!');

  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProgramTasks().catch(console.error);