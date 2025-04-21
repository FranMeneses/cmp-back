import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { ComplianceModule } from './compliance/compliance.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';

@Module({
  imports: [PrismaModule, TasksModule, ComplianceModule, SubtasksModule, BeneficiariesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
