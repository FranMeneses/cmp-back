import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateRiskDto {
  @IsString()
  @IsNotEmpty()
  type: string;
} 