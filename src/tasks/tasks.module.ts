import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { SubtasksModule } from '../subtasks/subtasks.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [PrismaModule, SubtasksModule, HistoryModule],
  providers: [TasksService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {} 