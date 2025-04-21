import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateInvestmentDto {
  @IsString()
  @IsNotEmpty()
  line: string;
} 