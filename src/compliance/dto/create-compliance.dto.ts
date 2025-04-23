import { IsString, IsNotEmpty, IsUUID, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateComplianceDto {
  @IsUUID()
  @IsNotEmpty()
  id_subtarea: string;

  @IsInt()
  @IsNotEmpty()
  id_cumplimiento_estado: number;

  @IsBoolean()
  @IsOptional()
  aplica?: boolean;
} 