import { IsString, IsNotEmpty, IsUUID, IsInt } from 'class-validator';

export class CreateInfoDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsInt()
  @IsNotEmpty()
  originId: number;

  @IsInt()
  @IsNotEmpty()
  investmentId: number;

  @IsInt()
  @IsNotEmpty()
  typeId: number;

  @IsInt()
  @IsNotEmpty()
  scopeId: number;

  @IsInt()
  @IsNotEmpty()
  interactionId: number;

  @IsInt()
  @IsNotEmpty()
  riskId: number;
} 