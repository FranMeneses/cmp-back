import { IsString, IsOptional } from 'class-validator';

export class UpdateRiskDto {
  @IsString()
  @IsOptional()
  tipo_riesgo?: string;
} 