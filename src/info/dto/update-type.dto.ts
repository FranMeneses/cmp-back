import { IsString, IsOptional } from 'class-validator';

export class UpdateTypeDto {
  @IsString()
  @IsOptional()
  tipo_name?: string;
} 