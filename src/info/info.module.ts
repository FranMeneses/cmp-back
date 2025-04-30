import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoResolver } from './info.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InfoService, InfoResolver],
  exports: [InfoService],
})
export class InfoModule {} 