import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class UpdateOriginDto {
  @IsString()
  @IsNotEmpty()
  name: string;
} 