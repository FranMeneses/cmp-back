import { IsString, IsOptional } from 'class-validator';

export class UpdateOriginDto {
  @IsString()
  @IsOptional()
  origen_name?: string;
} 