import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { EmailValidationService } from '../auth/email-validation.service';

/**
 * Módulo de gestión de usuarios del sistema.
 * 
 * @description Proporciona funcionalidades completas para la administración de usuarios:
 * - CRUD completo de usuarios con validaciones
 * - Sistema de roles y permisos jerárquicos
 * - Validación de emails mediante servicios externos
 * - Activación y desactivación de cuentas
 * - Asignación automática de roles (primer usuario = Admin)
 * - Gestión de contraseñas con hash seguro
 * 
 * @module UsersModule
 * @since 1.0.0
 */
@Module({
  imports: [PrismaModule, HttpModule],
  providers: [UsersService, UsersResolver, EmailValidationService],
  exports: [UsersService],
})
export class UsersModule {} 