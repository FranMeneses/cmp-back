import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceResolver } from './compliance.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ComplianceResolver, ComplianceService],
  exports: [ComplianceService]
})
export class ComplianceModule {} 