import { IsString, IsNotEmpty, IsUUID, IsInt } from 'class-validator';

export class CreateTaskDto {
  @IsInt()
  @IsNotEmpty()
  valleyId: number;

  @IsInt()
  @IsNotEmpty()
  facilityId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  status: number;
} 