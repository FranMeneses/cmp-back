import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateContactDto {
  @IsUUID()
  @IsNotEmpty()
  beneficiaryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
} 