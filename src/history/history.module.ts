import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [PrismaModule, TasksModule],
  controllers: [],
  providers: [HistoryService, HistoryResolver],
  exports: [HistoryService]
})
export class HistoryModule {} 