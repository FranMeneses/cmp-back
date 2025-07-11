import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { HistoryService } from './history.service';
import { HistoryResolver } from './history.resolver';
import { HistoryController } from './history.controller';

/**
 * Módulo de gestión completa del historial de tareas completadas con preservación de documentos.
 * 
 * @description Este módulo proporciona funcionalidades avanzadas para el manejo del historial del sistema:
 * - Consulta completa de registros históricos con API dual (GraphQL + REST)
 * - Integración nativa con Azure Blob Storage para documentos preservados
 * - Filtros especializados por proceso, valle, faena y beneficiario
 * - Descarga segura de documentos históricos con soporte Unicode
 * - Eliminación controlada de registros y documentos históricos
 * - Preservación de metadatos SAP (SOLPED_MEMO_SAP, HES_HEM_SAP) para auditoría
 * - Transformación automática entre formatos de base de datos y GraphQL
 * - Headers HTTP optimizados para descarga con configuración CORS
 * - Operaciones de limpieza masiva para mantenimiento del sistema
 * - Logging detallado para troubleshooting y auditoría de operaciones
 * - Manejo robusto de errores con códigos HTTP apropiados
 * - Soporte para análisis histórico y generación de reportes
 * - Configuración flexible para entornos con o sin Azure Storage
 * 
 * El historial se genera automáticamente cuando las tareas se completan y se mueven
 * desde el sistema activo, preservando toda la información relevante para cumplimiento
 * normativo y análisis de rendimiento histórico.
 * 
 * @module HistoryModule
 * @since 1.0.0
 */
@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryResolver],
  exports: [HistoryService]
})
export class HistoryModule {} 