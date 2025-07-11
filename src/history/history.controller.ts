import { Controller, Get, Param, Res, HttpException, HttpStatus, Delete } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Controlador REST para operaciones de archivos del historial.
 * 
 * @description Proporciona endpoints REST especializados para gestión de archivos históricos:
 * - Descarga segura de documentos históricos preservados
 * - Eliminación controlada de documentos históricos individuales
 * - Eliminación masiva de registros de historial completos
 * - Headers HTTP optimizados para descarga con soporte Unicode
 * - Configuración CORS flexible para frontend
 * - Manejo robusto de errores con códigos HTTP apropiados
 * - Integración transparente con Azure Blob Storage
 * - Logging de operaciones para auditoría de acceso a archivos
 * - Soporte para caracteres especiales en nombres de archivo
 * - Operaciones de limpieza para mantenimiento del sistema
 * 
 * @controller history
 * @since 1.0.0
 */
@Controller('history')
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Descarga un documento histórico específico.
   * 
   * @description Endpoint para descarga segura de archivos preservados del historial:
   * 1. Obtiene el archivo desde Azure Blob Storage
   * 2. Aplica sanitización del nombre para headers HTTP
   * 3. Configura headers CORS apropiados para el frontend
   * 4. Preserva caracteres Unicode usando encoding UTF-8
   * 5. Establece headers de cache y tipo de contenido
   * 6. Retorna el archivo como stream optimizado
   * 
   * @param id - ID único del documento histórico
   * @param res - Objeto Response de Express para configurar headers
   * 
   * @throws HttpException 404 si el documento no existe o no se puede descargar
   * 
   * @since 1.0.0
   */
  @Get('documents/download/:id')
  async downloadHistoryDocument(@Param('id') id: string, @Res() res: Response) {
    try {
      const fileData = await this.historyService.downloadHistoryDocument(id);
      
      // Permite caracteres Unicode (incluyendo acentos) pero remueve caracteres problemáticos para headers HTTP
      const safeFilename = fileData.filename.replace(/[<>:"/\\|?*\x00-\x1f]/gi, '_');
      
      const allowedOrigin = this.configService.get<string>('FRONTEND_URL') || '*';
      
      res.set({
        'Content-Type': fileData.contentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(safeFilename)}`,
        'Content-Length': fileData.size.toString(),
        'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': 'no-cache',
      });
      
      res.send(fileData.buffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to download history document',
        HttpStatus.NOT_FOUND
      );
    }
  }

  /**
   * Elimina un documento histórico específico del sistema.
   * 
   * @description Endpoint para eliminación completa de un documento histórico:
   * 1. Elimina el archivo físico de Azure Blob Storage
   * 2. Elimina los metadatos de la base de datos
   * 3. Retorna confirmación con detalles de la operación
   * 4. Maneja errores gracefully con mensajes informativos
   * 
   * Esta operación es irreversible y elimina permanentemente el documento.
   * 
   * @param id - ID único del documento histórico a eliminar
   * @returns Objeto con resultado de la eliminación y detalles del archivo
   * 
   * @throws HttpException 404 si el documento no existe
   * 
   * @since 1.0.0
   */
  @Delete('documents/:id')
  async deleteHistoryDocument(@Param('id') id: string) {
    try {
      const result = await this.historyService.deleteHistoryDocument(id);
      return { 
        success: true, 
        message: `History document "${result.filename}" deleted successfully`,
        ...result 
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete history document',
        HttpStatus.NOT_FOUND
      );
    }
  }

  /**
   * Elimina un registro de historial completo con todos sus documentos.
   * 
   * @description Endpoint para eliminación masiva de un registro histórico:
   * 1. Elimina todos los documentos asociados de Azure Blob Storage
   * 2. Elimina todos los metadatos de documentos históricos
   * 3. Elimina el registro principal del historial
   * 4. Retorna estadísticas detalladas de la operación
   * 5. Maneja errores parciales continuando con otros elementos
   * 
   * Esta operación es especialmente útil para limpieza de datos obsoletos
   * o corrección de inconsistencias en el historial.
   * 
   * @param id - ID único del registro de historial a eliminar
   * @returns Objeto con estadísticas completas de la eliminación
   * 
   * @throws HttpException 404 si el registro de historial no existe
   * 
   * @since 1.0.0
   */
  @Delete(':id')
  async deleteHistory(@Param('id') id: string) {
    try {
      const result = await this.historyService.deleteHistory(id);
      return { 
        success: true, 
        message: `History "${result.name}" deleted successfully with ${result.deletedDocuments}/${result.totalDocuments} documents`,
        ...result 
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete history',
        HttpStatus.NOT_FOUND
      );
    }
  }
} 