import { Injectable } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateDocumentInput } from '../graphql/graphql.types';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
  private containerClient: ContainerClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not configured');
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = blobServiceClient.getContainerClient('cmpdocs');
  }

  /**
   * Sube un archivo a Azure Blob Storage sin guardar metadata en la base de datos
   */
  async uploadBlobOnly(file: Express.Multer.File) {

    
    if (!file) {
      throw new Error('File is null or undefined');
    }
    
    if (file.buffer) {
    } else {
      throw new Error('File buffer is undefined. Make sure Multer is configured to use memory storage.');
    }

    try {
      const uniqueId = crypto.randomUUID();
      const fileExtension = file.originalname.split('.').pop();
      const blobName = `${uniqueId}.${fileExtension}`;
      
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(file.buffer, file.buffer.length);
      
      return {
        ruta: blockBlobClient.url,
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crea un registro de documento en la base de datos con la ruta del blob
   */
  async createDocumentMetadata(input: CreateDocumentInput) {
    return this.prisma.documento.create({
      data: {
        tipo_documento: input.tipo_documento,
        ruta: input.ruta,
        id_tarea: input.id_tarea || null,
        id_subtarea: input.id_subtarea || null,
        fecha_carga: new Date()
      },
      include: {
        tarea: true,
        subtarea: true,
        tipo_doc: true
      }
    });
  }

  /**
   * Método completo que sube el archivo y guarda la metadata
   */
  async uploadFile(file: Express.Multer.File, input: CreateDocumentDto) {
    const blobInfo = await this.uploadBlobOnly(file);
    
    return this.prisma.documento.create({
      data: {
        tipo_documento: input.tipo_documento,
        ruta: blobInfo.ruta,
        id_tarea: input.id_tarea || null,
        id_subtarea: input.id_subtarea || null,
        fecha_carga: new Date()
      },
      include: {
        tarea: true,
        subtarea: true,
        tipo_doc: true
      }
    });
  }

  async getFile(id_documento: string) {
    return this.prisma.documento.findUnique({
      where: { id_documento },
      include: {
        tarea: true,
        subtarea: true,
        tipo_doc: true
      }
    });
  }

  async listFiles(tipo_documento?: number) {
    return this.prisma.documento.findMany({
      where: tipo_documento ? { tipo_documento } : undefined,
      include: {
        tarea: true,
        subtarea: true,
        tipo_doc: true
      }
    });
  }

  async deleteFile(id_documento: string) {
    const doc = await this.prisma.documento.findUnique({
      where: { id_documento }
    });

    if (!doc) {
      throw new Error(`Document with ID ${id_documento} not found`);
    }

    const url = new URL(doc.ruta);
    const blobName = url.pathname.split('/').pop();

    if (blobName) {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    }

    return this.prisma.documento.delete({
      where: { id_documento }
    });
  }

  async getAllDocumentTypes() {
    return this.prisma.tipo_documento.findMany();
  }
} 