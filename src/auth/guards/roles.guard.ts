import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard para autorización basada en roles de usuario.
 * 
 * @description Valida que el usuario autenticado tenga uno de los roles requeridos
 * para acceder a un resolver o método específico. Debe usarse después de un guard
 * de autenticación (JwtAuthGuard) para asegurar que req.user existe.
 * 
 * @class RolesGuard
 * @implements CanActivate
 * @injectable
 * 
 * @throws {ForbiddenException} Cuando el usuario no está autenticado
 * @throws {ForbiddenException} Cuando el usuario no tiene los roles requeridos
 * @since 1.0.0
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determina si el usuario actual puede activar/acceder al recurso solicitado.
   * 
   * @description Verifica los roles requeridos mediante metadatos del decorador @Roles
   * y compara con el rol del usuario autenticado. Si no hay roles especificados,
   * permite el acceso (comportamiento permisivo).
   * 
   * @param {ExecutionContext} context - Contexto de ejecución que contiene información de la request
   * 
   * @returns {boolean} true si el usuario puede acceder, false en caso contrario
   * 
   * @throws {ForbiddenException} Cuando el usuario no está autenticado o no tiene permisos
   * 
   * @since 1.0.0
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No hay roles requeridos, permitir acceso
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.some((role) => user.rol?.nombre === role);
    
    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Roles requeridos: ${requiredRoles.join(', ')}. Tu rol: ${user.rol?.nombre || 'sin rol'}`
      );
    }

    return true;
  }
} 