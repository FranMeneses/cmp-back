import { IsString, IsNotEmpty, IsUUID, IsInt } from 'class-validator';

export class CreateInfoDto {
  @IsUUID()
  @IsNotEmpty()
  id_tarea: string;

  @IsInt()
  @IsNotEmpty()
  id_origen: number;

  @IsInt()
  @IsNotEmpty()
  id_inversion: number;

  @IsInt()
  @IsNotEmpty()
  id_tipo: number;

  @IsInt()
  @IsNotEmpty()
  id_alcance: number;

  @IsInt()
  @IsNotEmpty()
  id_interaccion: number;

  @IsInt()
  @IsNotEmpty()
  id_riesgo: number;
} 