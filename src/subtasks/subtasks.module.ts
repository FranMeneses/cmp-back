import { Module } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubtasksResolver } from './subtasks.resolver';

@Module({
  providers: [SubtasksService, PrismaService, SubtasksResolver],
  exports: [SubtasksService],
})
export class SubtasksModule {} 