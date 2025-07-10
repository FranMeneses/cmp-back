import { Module } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubtasksResolver } from './subtasks.resolver';

/**
 * Módulo de gestión de subtareas del sistema.
 * 
 * @description Este módulo maneja las subtareas que componen las tareas principales:
 * - CRUD completo de subtareas con estados y prioridades
 * - Gestión de presupuestos y gastos por subtarea
 * - Control de fechas: inicio, término y finalización
 * - Consultas por estado, prioridad y período temporal
 * - Catálogos de estados y prioridades disponibles
 * - Mapeo automático entre formatos de BD y GraphQL
 * - Integración directa con el módulo de tareas principales
 * 
 * @module SubtasksModule
 * @since 1.0.0
 */
@Module({
  providers: [SubtasksService, PrismaService, SubtasksResolver],
  exports: [SubtasksService],
})
export class SubtasksModule {} 