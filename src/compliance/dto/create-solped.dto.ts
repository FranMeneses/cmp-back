import { IsString, IsNotEmpty, IsUUID, IsOptional, IsInt } from 'class-validator';

export class CreateSolpedDto {
  @IsUUID()
  @IsNotEmpty()
  registryId: string;

  @IsInt()
  @IsOptional()
  ceco?: number;

  @IsInt()
  @IsOptional()
  account?: number;

  @IsInt()
  @IsOptional()
  value?: number;
} 