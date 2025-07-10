import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { PrismaService } from '../prisma/prisma.service';
import { BeneficiariesResolver } from './beneficiaries.resolver';

/**
 * Módulo de gestión de beneficiarios y sus contactos.
 * 
 * @description Este módulo maneja las entidades que reciben los beneficios de las tareas:
 * - CRUD completo de beneficiarios con información legal y organizacional
 * - Gestión de contactos asociados a cada beneficiario
 * - Validación de datos jurídicos: RUT, personalidad jurídica, representantes
 * - Relación bidireccional con tareas del sistema
 * - Mapeo automático entre formatos de BD y GraphQL
 * - Operaciones en transacción para mantener integridad referencial
 * - API GraphQL unificada para beneficiarios y contactos
 * 
 * @module BeneficiariesModule
 * @since 1.0.0
 */
@Module({
  providers: [BeneficiariesService, PrismaService, BeneficiariesResolver],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {} 