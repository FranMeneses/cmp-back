import { IsString, IsNumber, IsOptional, Matches } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

/**
 * DTO para la creación de metadatos de documentos.
 * 
 * @description Define la estructura de datos para registrar un documento en el sistema.
 * Los archivos físicos se suben por separado via API REST, este DTO maneja únicamente
 * los metadatos asociados. Incluye validaciones específicas para nombres de archivo
 * que garantizan compatibilidad con sistemas de archivos y Azure Blob Storage.
 * 
 * @class CreateDocumentDto
 * @since 1.0.0
 */
@InputType()
export class CreateDocumentDto {
  /**
   * ID del tipo de documento según catálogo de tipos.
   */
  @Field(() => Int)
  @IsNumber()
  tipo_documento: number;

  /**
   * ID de la tarea a la que se asocia el documento (opcional).
   */
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id_tarea?: string;

  /**
   * Nombre del archivo con validación de caracteres prohibidos.
   * Se excluyen caracteres que pueden causar problemas en sistemas de archivos.
   */
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @Matches(/^[^<>:"/\\|?*\x00-\x1f]*$/, {
    message: 'El nombre del archivo contiene caracteres no válidos. Evite usar los siguientes caracteres: < > : " / \\ | ? *'
  })
  nombre_archivo?: string;
} 