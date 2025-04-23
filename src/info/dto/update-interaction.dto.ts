import { IsString, IsOptional } from 'class-validator';

export class UpdateInteractionDto {
  @IsString()
  @IsOptional()
  operacion?: string;
} 