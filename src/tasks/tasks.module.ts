import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksResolver } from './tasks.resolver';
import { SubtasksModule } from '../subtasks/subtasks.module';
import { InfoModule } from '../info/info.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, SubtasksModule, InfoModule],
  providers: [TasksService, PrismaService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {} 