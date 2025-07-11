import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { EtlService } from './etl.service';
import { EtlController } from './etl.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksModule } from '../tasks/tasks.module';
import { SubtasksModule } from '../subtasks/subtasks.module';
import { InfoModule } from '../info/info.module';
import { DocumentsModule } from '../documents/documents.module';
import { ComplianceModule } from '../compliance/compliance.module';

/**
 * Módulo de ETL (Extract, Transform, Load) para carga masiva de datos empresariales desde Excel.
 * 
 * @description Este módulo proporciona funcionalidades avanzadas para importación masiva de datos:
 * - Procesamiento completo de archivos Excel (.xlsx/.xls) con estructura empresarial
 * - Carga masiva de tareas con validación automática de duplicados y integridad
 * - Resolución inteligente de entidades relacionadas mediante búsqueda fuzzy
 * - Sistema de caché optimizado para minimizar consultas repetidas a base de datos
 * - Integración nativa con todos los módulos del sistema (Tasks, Subtasks, Info, Documents, Compliance)
 * - Configuración Multer para manejo eficiente de archivos en memoria
 * - Creación automática de registros de compliance cuando las tareas lo requieren
 * - Preservación de archivos procesados en Azure Blob Storage para auditoría
 * - Manejo robusto de errores con procesamiento individual por fila de datos
 * - Estadísticas detalladas de procesamiento con éxitos, fallos y errores específicos
 * - Soporte para múltiples hojas de trabajo en un solo archivo Excel
 * - Transformación automática de datos de Excel a DTOs del sistema
 * - Validación de formatos y estructura de datos de entrada
 * - Logging detallado para troubleshooting y auditoría de importaciones
 * 
 * **Flujo de procesamiento ETL:**
 * 1. **Extract**: Lectura de archivo Excel y extracción de datos de hojas específicas
 * 2. **Transform**: Resolución de IDs, validación de datos y mapeo a DTOs
 * 3. **Load**: Creación masiva de entidades con manejo de errores individuales
 * 
 * **Estructura de archivos Excel soportada:**
 * - **Hoja 'Tareas'**: Información básica de tareas (Nombre, Descripción, Valle, Faena, Proceso, Cumplimiento)
 * - **Hoja 'Info'**: Información adicional (Nombre, Origen, Línea Inversión, Tipo Iniciativa, Alcance, Interacción, Riesgo)
 * 
 * **Dependencias integradas:**
 * - TasksModule: Para creación y validación de tareas
 * - SubtasksModule: Para gestión de subtareas relacionadas
 * - InfoModule: Para información adicional de tareas
 * - DocumentsModule: Para preservación de archivos en Azure Storage
 * - ComplianceModule: Para creación automática de registros de cumplimiento
 * 
 * @module EtlModule
 * @since 1.0.0
 */
@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    PrismaModule,
    TasksModule,
    SubtasksModule,
    InfoModule,
    DocumentsModule,
    ComplianceModule,
  ],
  controllers: [EtlController],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule {} 