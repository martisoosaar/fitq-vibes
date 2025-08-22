import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function importProgramTasks() {
  // Connect to MySQL to import from SQL dump
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'fitqvibes_import',
    multipleStatements: true
  });

  try {
    console.log('Creating temporary import database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS fitqvibes_import');
    await connection.execute('USE fitqvibes_import');

    console.log('Importing SQL dump...');
    const fs = require('fs');
    const sqlDump = fs.readFileSync('/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql', 'utf8');
    
    // Split by delimiter and execute in chunks
    const statements = sqlDump.split(';\n').filter(s => s.trim());
    let count = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement + ';');
          count++;
          if (count % 100 === 0) {
            console.log(`Executed ${count} statements...`);
          }
        } catch (err) {
          // Skip errors for tables/data that already exist
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate entry')) {
            console.error('Error executing statement:', err.message);
          }
        }
      }
    }

    console.log('Importing text tasks...');
    const [textTasks] = await connection.execute(
      'SELECT * FROM trainer_program_unit_text_tasks'
    );
    
    for (const task of textTasks as any[]) {
      await prisma.trainerProgramUnitTextTask.create({
        data: {
          id: BigInt(task.id),
          unitId: BigInt(task.unit_id),
          order: task.order,
          title: task.title,
          description: task.description,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          deletedAt: task.deleted_at
        }
      }).catch(err => {
        console.log(`Skipping duplicate text task ${task.id}`);
      });
    }
    console.log(`Imported ${textTasks.length} text tasks`);

    console.log('Importing video tasks...');
    const [videoTasks] = await connection.execute(
      'SELECT * FROM trainer_program_unit_video_tasks'
    );
    
    for (const task of videoTasks as any[]) {
      await prisma.trainerProgramUnitVideoTask.create({
        data: {
          id: BigInt(task.id),
          unitId: BigInt(task.unit_id),
          videoId: task.video_id,
          order: task.order,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          deletedAt: task.deleted_at
        }
      }).catch(err => {
        console.log(`Skipping duplicate video task ${task.id}`);
      });
    }
    console.log(`Imported ${videoTasks.length} video tasks`);

    console.log('Importing files...');
    const [files] = await connection.execute(
      'SELECT * FROM trainer_program_unit_files'
    );
    
    for (const file of files as any[]) {
      await prisma.trainerProgramUnitFile.create({
        data: {
          id: BigInt(file.id),
          unitId: BigInt(file.unit_id),
          order: file.order,
          title: file.title,
          file: file.file,
          createdAt: file.created_at,
          updatedAt: file.updated_at,
          deletedAt: file.deleted_at
        }
      }).catch(err => {
        console.log(`Skipping duplicate file ${file.id}`);
      });
    }
    console.log(`Imported ${files.length} files`);

    console.log('Importing workout template tasks...');
    const [workoutTasks] = await connection.execute(
      'SELECT * FROM trainer_program_unit_workout_template_tasks'
    );
    
    for (const task of workoutTasks as any[]) {
      await prisma.trainerProgramUnitWorkoutTemplateTask.create({
        data: {
          id: BigInt(task.id),
          unitId: BigInt(task.unit_id),
          order: task.order,
          title: task.title,
          workoutTemplateId: task.workout_template_id,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          deletedAt: task.deleted_at
        }
      }).catch(err => {
        console.log(`Skipping duplicate workout task ${task.id}`);
      });
    }
    console.log(`Imported ${workoutTasks.length} workout template tasks`);

    console.log('Importing cardio template tasks...');
    const [cardioTasks] = await connection.execute(
      'SELECT * FROM trainer_program_unit_cardio_template_tasks'
    );
    
    for (const task of cardioTasks as any[]) {
      await prisma.trainerProgramUnitCardioTemplateTask.create({
        data: {
          id: BigInt(task.id),
          unitId: BigInt(task.unit_id),
          order: task.order,
          title: task.title,
          cardioTemplateId: task.cardio_template_id,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          deletedAt: task.deleted_at
        }
      }).catch(err => {
        console.log(`Skipping duplicate cardio task ${task.id}`);
      });
    }
    console.log(`Imported ${cardioTasks.length} cardio template tasks`);

    console.log('Importing program users...');
    const [programUsers] = await connection.execute(
      'SELECT * FROM trainer_program_users WHERE deleted_at IS NULL'
    );
    
    for (const pUser of programUsers as any[]) {
      await prisma.trainerProgramUser.create({
        data: {
          id: BigInt(pUser.id),
          programId: BigInt(pUser.program_id),
          userId: pUser.user_id,
          startDate: pUser.start_date,
          status: pUser.status || 'ACTIVE',
          currentUnit: pUser.current_unit,
          createdAt: pUser.created_at,
          updatedAt: pUser.updated_at,
          deletedAt: pUser.deleted_at
        }
      }).catch(err => {
        console.log(`Skipping duplicate program user ${pUser.id}`);
      });
    }
    console.log(`Imported ${programUsers.length} program users`);

    console.log('Importing user units done...');
    const [unitsDone] = await connection.execute(
      'SELECT * FROM trainer_program_user_unit_done'
    );
    
    for (const unit of unitsDone as any[]) {
      await prisma.trainerProgramUserUnitDone.create({
        data: {
          id: BigInt(unit.id),
          programUserId: BigInt(unit.program_user_id),
          unitId: BigInt(unit.unit_id),
          completedAt: unit.completed_at,
          createdAt: unit.created_at,
          updatedAt: unit.updated_at
        }
      }).catch(err => {
        console.log(`Skipping duplicate unit done ${unit.id}`);
      });
    }
    console.log(`Imported ${unitsDone.length} user units done`);

    console.log('Importing user tasks done...');
    const [tasksDone] = await connection.execute(
      'SELECT * FROM trainer_program_user_tasks_done'
    );
    
    for (const task of tasksDone as any[]) {
      await prisma.trainerProgramUserTaskDone.create({
        data: {
          id: BigInt(task.id),
          programUserId: BigInt(task.program_user_id),
          taskType: task.task_type,
          taskId: BigInt(task.task_id),
          workoutId: task.workout_id,
          completedAt: task.completed_at,
          createdAt: task.created_at,
          updatedAt: task.updated_at
        }
      }).catch(err => {
        console.log(`Skipping duplicate task done ${task.id}`);
      });
    }
    console.log(`Imported ${tasksDone.length} user tasks done`);

    console.log('Import complete!');

  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await connection.end();
    await prisma.$disconnect();
  }
}

importProgramTasks().catch(console.error);