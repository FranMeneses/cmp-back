import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';
import { HistoryController } from './history.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryResolver],
  exports: [HistoryService]
})
export class HistoryModule {} 