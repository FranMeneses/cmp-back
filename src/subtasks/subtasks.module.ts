import { Module } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { SubtasksController } from './subtasks.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubtasksController],
  providers: [SubtasksService, PrismaService],
  exports: [SubtasksService],
})
export class SubtasksModule {} 