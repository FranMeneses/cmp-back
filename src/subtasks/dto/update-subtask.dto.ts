import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateSubtaskDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  nombre?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_tarea?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_estado?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_prioridad?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_beneficiario?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  presupuesto?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  gasto?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fecha_inicio?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fecha_termino?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fecha_final?: string;
} 