import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateBeneficiaryDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre_legal: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  rut: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  tipo_entidad: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  representante: string;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  personalidad_juridica: number;
} 