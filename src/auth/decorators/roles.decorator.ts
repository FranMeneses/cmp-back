import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar qué roles pueden acceder a un resolver/método específico.
 * 
 * @description Utiliza los metadatos de NestJS para marcar métodos con los roles requeridos.
 * Debe ser usado en conjunto con RolesGuard para hacer efectiva la restricción de acceso.
 * 
 * @param {...string[]} roles - Lista de nombres de roles que pueden acceder al método
 * 
 * @returns {MethodDecorator} Decorador que establece los metadatos de roles
 * 
 * @see RolesGuard Para la implementación de la validación de roles
 * @since 1.0.0
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles); 