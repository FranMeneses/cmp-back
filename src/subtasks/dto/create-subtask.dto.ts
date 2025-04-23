import { IsString, IsNotEmpty, IsUUID, IsInt, IsDate, IsOptional } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateSubtaskDto {
  @Field({ nullable: true })
  @IsUUID()
  @IsNotEmpty()
  id_tarea: string;

  @Field(() => Int)
  @IsInt()
  @IsOptional()
  numero?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  nombre?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  presupuesto?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  gasto?: number;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  fecha_inicio?: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  fecha_termino?: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  fecha_final?: Date;

  @Field(() => Int, { nullable: true })
  @IsUUID()
  @IsNotEmpty()
  id_beneficiario: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  id_estado?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsNotEmpty()
  id_prioridad: number;
} 