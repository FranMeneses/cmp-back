import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateContactDto {
  @IsUUID()
  @IsNotEmpty()
  id_beneficiario: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  mail?: string;

  @IsString()
  @IsOptional()
  phone?: string;
} 