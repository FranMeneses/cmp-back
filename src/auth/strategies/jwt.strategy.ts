import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * Estrategia JWT de Passport para autenticación de tokens Bearer.
 * 
 * @description Configura Passport para validar tokens JWT en las requests HTTP.
 * Extrae el token del header Authorization y valida su firma usando la clave secreta.
 * Si el token es válido, inyecta la información del usuario en el contexto de la request.
 * 
 * @class JwtStrategy
 * @extends PassportStrategy
 * @injectable
 * 
 * @since 1.0.0
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'tu-secreto-jwt-super-seguro-2024',
    });
  }

  /**
   * Valida el payload de un token JWT y retorna la información del usuario.
   * 
   * @description Este método es llamado automáticamente por Passport después de
   * verificar la firma del token. Valida que el usuario exista y esté activo.
   * 
   * @param {any} payload - Payload decodificado del JWT (contiene email, sub, rol, etc.)
   * 
   * @returns {Promise<any>} Información del usuario para inyectar en req.user
   * 
   * @throws {UnauthorizedException} Si el usuario no existe o está desactivado
   * 
   * @since 1.0.0
   */
  async validate(payload: any) {
    return this.authService.validateJwt(payload);
  }
} 