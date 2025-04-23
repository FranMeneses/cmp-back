import { IsString, IsOptional } from 'class-validator';

export class UpdateScopeDto {
  @IsString()
  @IsOptional()
  alcance_name?: string;
} 