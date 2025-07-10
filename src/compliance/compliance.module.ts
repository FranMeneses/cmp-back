import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceResolver } from './compliance.resolver';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de gestión de cumplimiento normativo y regulatorio.
 * 
 * @description Este módulo maneja el cumplimiento de requisitos normativos para las tareas:
 * - CRUD completo de registros de cumplimiento asociados a tareas
 * - Gestión de estados de cumplimiento con flujo secuencial automatizado
 * - Integración con sistemas SAP mediante campos específicos (SOLPED, HES/HEM)
 * - Control financiero con valores, centros de costo y cuentas contables
 * - Auto-avance de estados cuando se marca como "listo"
 * - Filtros especializados por estado y actividad
 * - Validaciones de integridad: una tarea solo puede tener un cumplimiento
 * - Verificación de aplicabilidad de cumplimiento por tarea
 * 
 * @module ComplianceModule
 * @since 1.0.0
 */
@Module({
  imports: [PrismaModule],
  providers: [ComplianceResolver, ComplianceService],
  exports: [ComplianceService]
})
export class ComplianceModule {} 