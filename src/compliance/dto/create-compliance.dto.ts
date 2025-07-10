import { IsString, IsNotEmpty, IsUUID, IsInt, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para la creación de nuevos registros de cumplimiento.
 * 
 * @description Define la estructura mínima para crear un cumplimiento asociado a una tarea.
 * El sistema verificará automáticamente que la tarea exista, aplique para cumplimiento,
 * y no tenga ya un registro de cumplimiento existente.
 * 
 * @class CreateComplianceDto
 * @since 1.0.0
 */
export class CreateComplianceDto {
  /**
   * ID único de la tarea a la que se asociará el cumplimiento.
   */
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  /**
   * ID del estado inicial de cumplimiento (opcional, se asignará por defecto si no se especifica).
   */
  @IsInt()
  @IsOptional()
  statusId?: number;
} 