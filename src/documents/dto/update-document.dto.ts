import { IsString, IsNumber, IsOptional } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

/**
 * DTO para la actualización de metadatos de documentos.
 * 
 * @description Permite actualización parcial de metadatos de documentos existentes.
 * No incluye actualización del archivo físico - para cambiar el archivo se debe
 * eliminar y crear un nuevo documento. Útil para reclasificar documentos o
 * cambiar su asociación con tareas.
 * 
 * @class UpdateDocumentDto
 * @since 1.0.0
 */
@InputType()
export class UpdateDocumentDto {
  /**
   * Nuevo tipo de documento para reclasificación.
   */
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  tipo_documento?: number;

  /**
   * Nueva tarea asociada o null para desasociar.
   */
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id_tarea?: string;

  /**
   * Nuevo nombre para el archivo (solo metadatos).
   */
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  nombre_archivo?: string;
} 