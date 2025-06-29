import { IsString, IsNotEmpty, IsUUID, IsOptional, IsBoolean, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRegistryDto {
  @IsUUID()
  @IsNotEmpty()
  complianceId: string;

  @IsBoolean()
  @IsOptional()
  hes?: boolean;

  @IsBoolean()
  @IsOptional()
  hem?: boolean;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  carta?: boolean;

  @IsBoolean()
  @IsOptional()
  minuta?: boolean;

  @IsBoolean()
  @IsOptional()
  es_solped?: boolean;

  @IsBoolean()
  @IsOptional()
  es_memo?: boolean;

  @IsNumber()
  @IsOptional()
  solpedMemoSap?: number;

  @IsNumber()
  @IsOptional()
  hesHemSap?: number;
} 