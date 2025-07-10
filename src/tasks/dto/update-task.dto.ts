import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

/**
 * DTO para la actualización de tareas existentes.
 * 
 * @description Permite la actualización parcial de cualquier campo de una tarea.
 * Todos los campos son opcionales para permitir actualizaciones granulares.
 * 
 * @class UpdateTaskDto
 * @since 1.0.0
 */
@InputType()
export class UpdateTaskDto {
  /**
   * Nuevo nombre para la tarea.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Nueva descripción de la tarea.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Nuevo valle asignado a la tarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  valleyId?: number;

  /**
   * Nueva faena asignada a la tarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  faenaId?: number;

  /**
   * Nuevo proceso al que pertenece la tarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  processId?: number;

  /**
   * Nuevo estado de la tarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  statusId?: number;

  /**
   * Nuevo valor de aplicabilidad de la tarea.
   */
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  applies?: boolean;

  /**
   * Nuevo beneficiario asociado a la tarea.
   */
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  beneficiaryId?: string;
} 