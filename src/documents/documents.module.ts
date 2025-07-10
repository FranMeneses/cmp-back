import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsResolver } from './documents.resolver';
import { DocumentsController } from './documents.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

/**
 * Módulo de gestión completa de documentos con almacenamiento en la nube.
 * 
 * @description Este módulo proporciona funcionalidades avanzadas para el manejo de documentos:
 * - CRUD completo de metadatos de documentos en base de datos
 * - Integración nativa con Azure Blob Storage para almacenamiento de archivos
 * - API dual: GraphQL (metadatos) + REST (upload/download de archivos)
 * - Preservación de nombres con caracteres Unicode (acentos y caracteres especiales)
 * - Lógica inteligente de eliminación basada en el historial de tareas
 * - Configuración automática de Multer para manejo de archivos en memoria
 * - Gestión de tipos de documento mediante catálogos
 * - Validación y filtrado de archivos personalizable
 * - Soporte para documentos asociados a tareas específicas
 * - Headers HTTP optimizados para descarga con soporte CORS
 * 
 * @module DocumentsModule
 * @since 1.0.0
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
      preservePath: true,
      fileFilter: (req, file, cb) => {
        // Preservar el nombre original del archivo con acentos
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, true);
      },
    }),
  ],
  providers: [DocumentsService, DocumentsResolver],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {} 