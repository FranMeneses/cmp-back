import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsResolver } from './documents.resolver';
import { DocumentsController } from './documents.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [DocumentsService, DocumentsResolver],
  controllers: [DocumentsController],
})
export class DocumentsModule {} 