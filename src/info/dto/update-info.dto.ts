import { PartialType } from '@nestjs/mapped-types';
import { CreateInfoDto } from './create-info.dto';

/**
 * DTO para la actualización de información complementaria de tareas.
 * 
 * @description Permite la actualización parcial de cualquier campo de información.
 * Todos los campos del CreateInfoDto son opcionales para permitir actualizaciones
 * granulares de las diferentes categorías clasificatorias.
 * 
 * @class UpdateInfoDto
 * @since 1.0.0
 */
export class UpdateInfoDto extends PartialType(CreateInfoDto) {} 