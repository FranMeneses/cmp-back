import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateBeneficiaryDto {
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsString()
  @IsNotEmpty()
  representative: string;

  @IsBoolean()
  @IsNotEmpty()
  hasLegalPersonality: boolean;
} 