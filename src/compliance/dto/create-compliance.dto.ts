import { IsString, IsNotEmpty, IsUUID, IsInt, IsBoolean } from 'class-validator';

export class CreateComplianceDto {
  @IsString()
  @IsNotEmpty()
  subtaskId: string;

  @IsInt()
  @IsNotEmpty()
  statusId: number;

  @IsBoolean()
  @IsNotEmpty()
  applies: boolean;
} 