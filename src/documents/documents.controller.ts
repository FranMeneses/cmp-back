import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Express } from 'express';
import { memoryStorage } from 'multer';

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

  @Post('upload-complete')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileComplete(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    const result = await this.documentsService.uploadFile(file, createDocumentDto);
    return { success: true, id: result.id_documento };
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