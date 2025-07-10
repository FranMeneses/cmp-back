import { Field, InputType, Int, ID } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

/**
 * DTO para la creación de nuevas subtareas en el sistema.
 * 
 * @description Define la estructura de datos necesaria para crear una subtarea,
 * incluyendo asignación a tarea padre, fechas de seguimiento, presupuesto,
 * gastos y configuración de estado y prioridad.
 * 
 * @class CreateSubtaskDto
 * @since 1.0.0
 */
@InputType()
export class CreateSubtaskDto {
  /**
   * ID de la tarea padre a la que pertenece esta subtarea.
   */
  @Field(() => ID)
  @IsString()
  taskId: string;

  /**
   * Nombre identificatorio de la subtarea.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Descripción detallada del trabajo a realizar en la subtarea.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Presupuesto asignado para la subtarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  budget?: number;

  /**
   * Gasto real incurrido en la subtarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  expense?: number;

  /**
   * Fecha planificada de inicio de la subtarea.
   */
  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  /**
   * Fecha planificada de término de la subtarea.
   */
  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  /**
   * Fecha real de finalización de la subtarea.
   */
  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  finalDate?: Date;

  /**
   * ID del estado actual de la subtarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  statusId?: number;

  /**
   * ID de la prioridad asignada a la subtarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  priorityId?: number;
} 