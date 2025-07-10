import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Guard de autenticación JWT opcional para resolvers que pueden funcionar con o sin autenticación.
 * 
 * @description Similar a JwtAuthGuard pero no requiere autenticación obligatoria.
 * Si hay un token válido, inyecta el usuario en el contexto. Si no hay token
 * o es inválido, simplemente retorna null sin lanzar excepción.
 * 
 * @class OptionalJwtAuthGuard
 * @extends AuthGuard
 * @injectable
 * 
 * @since 1.0.0
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  /**
   * Extrae el objeto request del contexto de GraphQL.
   * 
   * @param {ExecutionContext} context - Contexto de ejecución de NestJS
   * @returns {any} Objeto request para que Passport pueda acceder a los headers
   * 
   * @since 1.0.0
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  /**
   * Maneja la respuesta de autenticación de forma permisiva.
   * 
   * @description A diferencia del guard estándar, no lanza excepción si no hay
   * autenticación. Retorna el usuario si existe, o null si no hay token válido.
   * 
   * @param {any} err - Error de autenticación (ignorado)
   * @param {any} user - Usuario autenticado o undefined
   * 
   * @returns {any} Usuario autenticado o null
   * 
   * @since 1.0.0
   */
  handleRequest(err: any, user: any) {
    // Retorna user si existe, o null si no hay autenticación
    // No lanza error si no hay token
    return user || null;
  }
} 