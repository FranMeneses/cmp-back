import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  id_valle?: number;

  @IsNumber()
  @IsOptional()
  id_faena?: number;

  @IsNumber()
  @IsOptional()
  id_estado?: number;
} 