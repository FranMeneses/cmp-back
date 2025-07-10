import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoResolver } from './info.resolver';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de gestión de información complementaria y metadatos de tareas.
 * 
 * @description Este módulo maneja información clasificatoria y descriptiva adicional para las tareas:
 * - CRUD completo de registros de información asociados a tareas
 * - Gestión de 6 categorías clasificatorias: Origen, Inversión, Tipo, Alcance, Interacción y Riesgo
 * - Catálogos completos para cada categoría con consultas individuales y listados
 * - Filtros especializados para obtener tareas por cada categoría
 * - Contadores estadísticos de tareas por categoría para dashboards
 * - Validaciones de integridad: una tarea solo puede tener un registro de información
 * - Mapeo automático entre formatos de BD y GraphQL
 * - API unificada para consultas de información y análisis categorial
 * 
 * @module InfoModule
 * @since 1.0.0
 */
@Module({
  imports: [PrismaModule],
  providers: [InfoService, InfoResolver],
  exports: [InfoService],
})
export class InfoModule {} 