import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateBeneficiaryDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  nombre_legal?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  rut?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  direccion?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  tipo_entidad?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  representante?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  personalidad_juridica?: number;
} 