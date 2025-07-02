import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, Param, Delete, Res, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { Express } from 'express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly configService: ConfigService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage() 
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('tipo_documento') tipo_documento?: string,
    @Body('id_tarea') id_tarea?: string
  ) {
    if (!file) {
      throw new Error('No file received in controller');
    }
    
    // Si se proporcionan metadatos, crear el documento completo
    if (tipo_documento) {
      const tipoDocumentoNum = parseInt(tipo_documento, 10);
      if (isNaN(tipoDocumentoNum)) {
        throw new Error('tipo_documento must be a valid number');
      }
      
      const result = await this.documentsService.uploadFileComplete(
        file, 
        tipoDocumentoNum, 
        id_tarea
      );
      
      return { 
        success: true, 
        ruta: result.ruta,
        filename: result.nombre_archivo,
        contentType: result.uploadInfo.contentType,
        id_documento: result.id_documento,
        document: result,
        message: `Archivo "${file.originalname}" subido y registrado correctamente`
      };
    } else {
      // Flujo tradicional: solo subir blob (retrocompatibilidad)
      const blobInfo = await this.documentsService.uploadBlobOnly(file);
      return { 
        success: true, 
        ruta: blobInfo.ruta,
        filename: blobInfo.filename,
        contentType: blobInfo.contentType
      };
    }
  }

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const fileData = await this.documentsService.downloadFile(id);
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
        error.message || 'Failed to download file',
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get()
  async findAll() {
    return this.documentsService.listFiles();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentsService.getFile(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.documentsService.deleteFile(id);
    return { success: true };
  }


} 