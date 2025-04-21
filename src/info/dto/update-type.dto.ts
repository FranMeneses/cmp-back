import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
} 