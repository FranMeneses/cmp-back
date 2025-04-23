import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateBeneficiaryDto {
  @IsString()
  @IsOptional()
  nombre_legal?: string;

  @IsString()
  @IsOptional()
  rut?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  tipo_entidad?: string;

  @IsString()
  @IsOptional()
  representante?: string;

  @IsBoolean()
  @IsOptional()
  personalidad_juridica?: boolean;
} 