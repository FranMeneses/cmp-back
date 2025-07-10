import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { SubtasksModule } from '../subtasks/subtasks.module';
import { ComplianceModule } from '../compliance/compliance.module';

/**
 * Módulo central del sistema que gestiona las tareas principales del proceso empresarial.
 * 
 * @description Este módulo es el núcleo del sistema de gestión de procesos y proporciona:
 * - CRUD completo de tareas con validación de duplicados
 * - Gestión de estados y progreso de tareas
 * - Integración con subtareas y sistema de compliance
 * - Análisis financiero: presupuestos y gastos por período
 * - Consultas complejas por valle, faena, proceso y fechas
 * - Estadísticas y reportes de gestión
 * - Mapeo automático entre formatos de base de datos y GraphQL
 * 
 * @module TasksModule
 * @since 1.0.0
 */
@Module({
  imports: [PrismaModule, SubtasksModule, ComplianceModule],
  providers: [TasksService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {} 