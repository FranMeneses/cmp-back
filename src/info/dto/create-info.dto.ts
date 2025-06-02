import { IsString, IsNotEmpty, IsUUID, IsInt, IsOptional } from 'class-validator';

export class CreateInfoDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsInt()
  @IsOptional()
  originId?: number;

  @IsInt()
  @IsOptional()
  investmentId?: number;

  @IsInt()
  @IsOptional()
  typeId?: number;

  @IsInt()
  @IsOptional()
  scopeId?: number;

  @IsInt()
  @IsOptional()
  interactionId?: number;

  @IsInt()
  @IsOptional()
  riskId?: number;
} 