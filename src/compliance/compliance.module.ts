import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceResolver } from './compliance.resolver';

@Module({
  providers: [ComplianceService, PrismaService, ComplianceResolver],
  exports: [ComplianceService],
})
export class ComplianceModule {} 