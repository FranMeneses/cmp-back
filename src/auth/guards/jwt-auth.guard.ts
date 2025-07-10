import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Guard de autenticación JWT para proteger resolvers de GraphQL.
 * 
 * @description Extiende AuthGuard de Passport para trabajar con GraphQL.
 * Requiere que el usuario esté autenticado con un token JWT válido.
 * Si el token es inválido o no existe, lanza una excepción de no autorizado.
 * 
 * @class JwtAuthGuard
 * @extends AuthGuard
 * @injectable
 * 
 * @throws {UnauthorizedException} Cuando no hay token o el token es inválido
 * @since 1.0.0
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Extrae el objeto request del contexto de GraphQL.
   * 
   * @description Convierte el ExecutionContext de NestJS al formato esperado
   * por Passport, permitiendo que el guard funcione con resolvers de GraphQL.
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
} 