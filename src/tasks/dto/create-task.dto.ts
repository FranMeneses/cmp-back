import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsNotEmpty()
  id_valle: number;

  @IsNumber()
  @IsNotEmpty()
  id_faena: number;

  @IsNumber()
  @IsOptional()
  id_estado?: number;
} 