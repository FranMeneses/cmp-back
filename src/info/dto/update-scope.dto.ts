import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateScopeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
} 