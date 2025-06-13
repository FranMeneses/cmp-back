import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { SubtasksModule } from '../subtasks/subtasks.module';
import { ComplianceModule } from '../compliance/compliance.module';

@Module({
  imports: [PrismaModule, SubtasksModule, ComplianceModule],
  providers: [TasksService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {} 