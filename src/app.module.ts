import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { ComplianceModule } from './compliance/compliance.module';

@Module({
  imports: [PrismaModule, TasksModule, ComplianceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
