import { Field, InputType, Int, ID } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

/**
 * DTO para la actualización de subtareas existentes.
 * 
 * @description Permite la actualización parcial de cualquier campo de una subtarea.
 * Todos los campos son opcionales para permitir actualizaciones granulares
 * de aspectos específicos como estado, fechas o presupuesto.
 * 
 * @class UpdateSubtaskDto
 * @since 1.0.0
 */
@InputType()
export class UpdateSubtaskDto {
  /**
   * Nuevo nombre para la subtarea.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Nueva descripción de la subtarea.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Nueva tarea padre asignada a la subtarea.
   */
  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  taskId?: string;

  /**
   * Nuevo estado de la subtarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  statusId?: number;

  /**
   * Nueva prioridad asignada a la subtarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  priorityId?: number;

  /**
   * Nuevo presupuesto de la subtarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  budget?: number;

  /**
   * Nuevo gasto incurrido en la subtarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  expense?: number;

  /**
   * Nueva fecha de inicio planificada.
   */
  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  /**
   * Nueva fecha de término planificada.
   */
  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  /**
   * Nueva fecha real de finalización.
   */
  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  finalDate?: Date;
} 