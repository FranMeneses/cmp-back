import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { PrismaService } from '../prisma/prisma.service';
import { BeneficiariesResolver } from './beneficiaries.resolver';

@Module({
  providers: [BeneficiariesService, PrismaService, BeneficiariesResolver],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {} 