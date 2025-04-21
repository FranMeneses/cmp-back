import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateInteractionDto {
  @IsString()
  @IsNotEmpty()
  operation: string;
} 