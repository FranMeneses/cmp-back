import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDate } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsNumber()
  @IsOptional()
  expense?: number;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsDate()
  @IsOptional()
  finalDate?: Date;

  @IsNumber()
  @IsNotEmpty()
  status: number;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsNumber()
  @IsOptional()
  valley?: number;

  @IsNumber()
  @IsOptional()
  faena?: number;
} 