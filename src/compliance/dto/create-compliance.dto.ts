import { IsString, IsNotEmpty, IsUUID, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateComplianceDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsInt()
  @IsOptional()
  statusId?: number;

  @IsBoolean()
  @IsOptional()
  applies?: boolean;
} 