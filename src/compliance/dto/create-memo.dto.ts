import { IsString, IsNotEmpty, IsUUID, IsOptional, IsInt } from 'class-validator';

export class CreateMemoDto {
  @IsUUID()
  @IsNotEmpty()
  registryId: string;

  @IsInt()
  @IsOptional()
  value?: number;
} 