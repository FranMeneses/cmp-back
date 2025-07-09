import { Controller, Get, Param, Res, HttpException, HttpStatus, Delete } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('history')
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly configService: ConfigService
  ) {}

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