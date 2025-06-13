import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [HistoryService, HistoryResolver],
  exports: [HistoryService]
})
export class HistoryModule {} 