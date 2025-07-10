import { IsString, IsNotEmpty, IsUUID, IsInt, IsOptional } from 'class-validator';

/**
 * DTO para la creación de información complementaria de tareas.
 * 
 * @description Define la estructura para asociar metadatos clasificatorios a una tarea.
 * Incluye 6 categorías opcionales que permiten clasificar y organizar las tareas
 * según diferentes criterios de negocio. El sistema verificará que la tarea
 * no tenga ya información asociada.
 * 
 * @class CreateInfoDto
 * @since 1.0.0
 */
export class CreateInfoDto {
  /**
   * ID único de la tarea a la que se asociará la información.
   */
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  /**
   * ID del origen/fuente de la tarea.
   */
  @IsInt()
  @IsOptional()
  originId?: number;

  /**
   * ID de la línea de inversión asociada.
   */
  @IsInt()
  @IsOptional()
  investmentId?: number;

  /**
   * ID del tipo/categoría de la tarea.
   */
  @IsInt()
  @IsOptional()
  typeId?: number;

  /**
   * ID del alcance de ejecución de la tarea.
   */
  @IsInt()
  @IsOptional()
  scopeId?: number;

  /**
   * ID del tipo de interacción/operación.
   */
  @IsInt()
  @IsOptional()
  interactionId?: number;

  /**
   * ID del tipo de riesgo asociado.
   */
  @IsInt()
  @IsOptional()
  riskId?: number;

  /**
   * Cantidad o volumen asociado a la tarea (formato texto).
   */
  @IsString()
  @IsOptional()
  quantity?: string;
} 