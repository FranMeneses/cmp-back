import { IsString, IsOptional } from 'class-validator';

export class UpdateInvestmentDto {
  @IsString()
  @IsOptional()
  linea?: string;
} 