import { PartialType } from '@nestjs/mapped-types';
import { CreateComplianceDto } from './create-compliance.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateComplianceDto extends PartialType(CreateComplianceDto) {
  @IsInt()
  @IsOptional()
  valor?: number;

  @IsInt()
  @IsOptional()
  ceco?: number;

  @IsInt()
  @IsOptional()
  cuenta?: number;

  @IsInt()
  @IsOptional()
  solpedMemoSap?: number;

  @IsInt()
  @IsOptional()
  hesHemSap?: number;
} 