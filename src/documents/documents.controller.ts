import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, Param, Delete, Res, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Express } from 'express';
import { memoryStorage } from 'multer';
import { Response } from 'express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage() 
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    
    if (!file) {
      throw new Error('No file received in controller');
    }
    
    const blobInfo = await this.documentsService.uploadBlobOnly(file);
    return { 
      success: true, 
      ruta: blobInfo.ruta,
      filename: blobInfo.filename,
      contentType: blobInfo.contentType
    };
  }

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const fileData = await this.documentsService.downloadFile(id);
      
      res.set({
        'Content-Type': fileData.contentType,
        'Content-Disposition': `attachment; filename="${fileData.filename}"`,
        'Content-Length': fileData.size.toString(),
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