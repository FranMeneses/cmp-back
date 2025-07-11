import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EtlService } from './etl.service';
import { memoryStorage } from 'multer';

/**
 * Controlador REST para operaciones de ETL (Extract, Transform, Load).
 * 
 * @description Proporciona endpoints especializados para carga masiva de datos empresariales:
 * - Upload y procesamiento de archivos Excel con estructura predefinida
 * - Validación de formatos de archivo (.xlsx/.xls) antes del procesamiento
 * - Configuración Multer optimizada para archivos en memoria
 * - Manejo robusto de errores con mensajes informativos
 * - Integración transparente con el servicio ETL para procesamiento completo
 * - Endpoint único para carga masiva de tareas e información relacionada
 * - Soporte para archivos Excel con múltiples hojas de trabajo
 * - Retorno de estadísticas detalladas del procesamiento realizado
 * - Preservación automática del archivo procesado en Azure Blob Storage
 * 
 * @controller etl
 * @since 1.0.0
 */
@Controller('etl')
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  /**
   * Procesa un archivo Excel para carga masiva de tareas y datos relacionados.
   * 
   * @description Endpoint principal para importación masiva de datos empresariales:
   * 1. Valida que se haya enviado un archivo
   * 2. Verifica que el archivo tenga extensión Excel (.xlsx/.xls)
   * 3. Procesa el archivo usando el servicio ETL
   * 4. Retorna estadísticas detalladas del procesamiento
   * 
   * **Estructura esperada del Excel:**
   * - **Hoja 'Tareas'**: Nombre, Descripción, Valle, Faena, Proceso, Cumplimiento
   * - **Hoja 'Info'**: Nombre, Origen, Línea Inversión, Tipo Iniciativa, Alcance, Interacción, Riesgo
   * 
   * **Funcionalidades del procesamiento:**
   * - Resolución automática de IDs por nombres de entidades
   * - Validación de duplicados en tareas
   * - Creación automática de compliance cuando aplica
   * - Manejo individual de errores por fila
   * - Preservación del archivo en Azure Blob Storage
   * 
   * @param file - Archivo Excel (.xlsx/.xls) con datos a procesar
   * @returns Estadísticas completas del procesamiento con éxitos, fallos y errores detallados
   * 
   * @throws Error si no se proporciona archivo
   * @throws Error si el archivo no tiene extensión Excel válida
   * @throws BadRequestException si hay errores críticos en el procesamiento
   * 
   * @since 1.0.0
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage()
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new Error('Only Excel files are allowed');
    }

    return this.etlService.processExcelFile(file);
  }
} 