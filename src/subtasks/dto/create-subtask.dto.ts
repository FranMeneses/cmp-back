import { IsString, IsNotEmpty, IsUUID, IsInt, IsDate, IsOptional } from 'class-validator';

export class CreateSubtaskDto {
  @IsUUID()
  @IsNotEmpty()
  id_tarea: string;

  @IsInt()
  @IsOptional()
  numero?: number;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @IsOptional()
  presupuesto?: number;

  @IsInt()
  @IsOptional()
  gasto?: number;

  @IsDate()
  @IsOptional()
  fecha_inicio?: Date;

  @IsDate()
  @IsOptional()
  fecha_termino?: Date;

  @IsDate()
  @IsOptional()
  fecha_final?: Date;

  @IsUUID()
  @IsNotEmpty()
  id_beneficiario: string;

  @IsInt()
  @IsOptional()
  id_estado?: number;

  @IsInt()
  @IsNotEmpty()
  id_prioridad: number;
} 