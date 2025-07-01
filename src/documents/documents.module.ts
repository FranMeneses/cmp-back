import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsResolver } from './documents.resolver';
import { DocumentsController } from './documents.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
      preservePath: true,
      fileFilter: (req, file, cb) => {
        // Preservar el nombre original del archivo con acentos
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, true);
      },
    }),
  ],
  providers: [DocumentsService, DocumentsResolver],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {} 