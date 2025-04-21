import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { BeneficiariesController } from './beneficiaries.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BeneficiariesController],
  providers: [BeneficiariesService, PrismaService],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {} 