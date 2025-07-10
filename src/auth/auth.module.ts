import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PasswordResetService } from './password-reset.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

/**
 * Módulo de autenticación que maneja la autenticación JWT, autorización basada en roles,
 * y funcionalidades de reseteo de contraseña.
 * 
 * @description Este módulo proporciona:
 * - Autenticación JWT con tokens de 24 horas de duración
 * - Sistema de roles y permisos
 * - Funcionalidad de reseteo de contraseña via email
 * - Guards para proteger rutas según autenticación y roles
 * - Estrategias de Passport para validación JWT
 * 
 * @module AuthModule
 * @requires UsersModule Para gestión de usuarios
 * @requires PassportModule Para estrategias de autenticación
 * @requires JwtModule Para generación y validación de tokens JWT
 * @requires HttpModule Para comunicación con servicios externos (Azure Logic Apps)
 * 
 * @exports AuthService Servicio principal de autenticación
 * @exports PasswordResetService Servicio para reseteo de contraseñas
 * 
 * @since 1.0.0
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'tu-secreto-jwt-super-seguro-2024',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, RolesGuard, PasswordResetService],
  exports: [AuthService, PasswordResetService],
})
export class AuthModule {} 