import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

/**
 * DTO para la creación de nuevas tareas en el sistema.
 * 
 * @description Define la estructura de datos necesaria para crear una tarea,
 * incluyendo información de ubicación (valle, faena), proceso asociado,
 * estado inicial y beneficiario si aplica.
 * 
 * @class CreateTaskDto
 * @since 1.0.0
 */
@InputType()
export class CreateTaskDto {
  /**
   * Nombre identificatorio de la tarea.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Descripción detallada de los objetivos y alcance de la tarea.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * ID del valle donde se ejecutará la tarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  valleyId?: number;

  /**
   * ID de la faena asociada a la tarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  faenaId?: number;

  /**
   * ID del proceso empresarial al que pertenece la tarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  processId?: number;

  /**
   * ID del estado inicial de la tarea.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  statusId?: number;

  /**
   * Indica si la tarea aplica o está habilitada para cumplimiento.
   */
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  applies?: boolean;

  /**
   * UUID del beneficiario asociado a la tarea, si aplica.
   */
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  beneficiaryId?: string;
} 