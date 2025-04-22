import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksResolver } from './tasks.resolver';

@Module({
  providers: [TasksService, PrismaService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {} 