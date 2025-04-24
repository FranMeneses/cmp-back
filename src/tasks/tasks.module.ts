import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksResolver } from './tasks.resolver';
import { SubtasksModule } from '../subtasks/subtasks.module';

@Module({
  imports: [SubtasksModule],
  providers: [TasksService, PrismaService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {} 