import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { EtlService } from './etl.service';
import { EtlController } from './etl.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksModule } from '../tasks/tasks.module';
import { SubtasksModule } from '../subtasks/subtasks.module';
import { InfoModule } from '../info/info.module';
import { DocumentsModule } from '../documents/documents.module';
import { ComplianceModule } from '../compliance/compliance.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    PrismaModule,
    TasksModule,
    SubtasksModule,
    InfoModule,
    DocumentsModule,
    ComplianceModule,
  ],
  controllers: [EtlController],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule {} 