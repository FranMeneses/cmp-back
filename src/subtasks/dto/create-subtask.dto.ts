import { IsString, IsNotEmpty, IsUUID, IsInt, IsDate, IsBoolean, IsOptional } from 'class-validator';

export class CreateSubtaskDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsInt()
  @IsNotEmpty()
  number: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  budget: number;

  @IsInt()
  @IsNotEmpty()
  expense: number;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsDate()
  @IsNotEmpty()
  finalDate: Date;

  @IsUUID()
  @IsNotEmpty()
  beneficiaryId: string;

  @IsInt()
  @IsNotEmpty()
  statusId: number;

  @IsInt()
  @IsNotEmpty()
  priorityId: number;
} 