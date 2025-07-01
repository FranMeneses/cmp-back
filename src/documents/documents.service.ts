import { Injectable, Logger } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentInput } from '../graphql/graphql.types';

@Injectable()
export class DocumentsService {
  private containerClient: ContainerClient;
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_NAME');
    const containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME') || 'cmpdocs';
    
    if (accountName) {
      try {
        const blobServiceClient = new BlobServiceClient(
          `https://${accountName}.blob.core.windows.net`,
          new DefaultAzureCredential()
        );
        this.containerClient = blobServiceClient.getContainerClient(containerName);
        this.logger.log('Azure Storage client initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Azure Storage client', error.message);
        this.containerClient = null;
      }
    } else {
      this.logger.warn('Azure Storage not configured - document operations will not work');
      this.containerClient = null;
    }
  }

  /**
   * Sube un archivo a Azure Blob Storage sin guardar metadata en la base de datos
   */
  async uploadBlobOnly(file: Express.Multer.File) {
    if (!this.containerClient) {
      throw new Error('Azure Storage is not configured. Cannot upload files.');
    }
    
    if (!file) {
      throw new Error('File is null or undefined');
    }
    
    if (!file.buffer) {
      throw new Error('File buffer is undefined. Make sure Multer is configured to use memory storage.');
    }

    try {
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
      const blobName = `${fileNameWithoutExt}_${timestamp}.${fileExtension}`;
      
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: file.mimetype || 'application/octet-stream',
          blobContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.originalname)}`,
        }
      };

      await blockBlobClient.upload(file.buffer, file.buffer.length, uploadOptions);
      
      this.logger.log(`File uploaded successfully: ${blobName}`);
      
      return {
        ruta: blockBlobClient.url,
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size
      };
    } catch (error) {
      this.logger.error('Failed to upload file to Azure Storage', error.message);
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
        nombre_archivo: input.nombre_archivo || null,
        fecha_carga: new Date()
      },
      include: {
        tarea: true,
        tipo_doc: true
      }
    });
  }

  /**
   * Descarga un archivo desde Azure Blob Storage
   */
  async downloadFile(id_documento: string) {
    if (!this.containerClient) {
      throw new Error('Azure Storage is not configured. Cannot download files.');
    }
    
    const doc = await this.prisma.documento.findUnique({
      where: { id_documento },
      include: {
        tipo_doc: true
      }
    });

    if (!doc) {
      throw new Error(`Document with ID ${id_documento} not found`);
    }

    if (!doc.ruta) {
      throw new Error(`Document ${id_documento} has no file path`);
    }

    try {
      this.logger.debug(`Downloading document ${id_documento}`);
      
      const url = new URL(doc.ruta);
      const encodedBlobName = url.pathname.split('/').pop();
      
      if (!encodedBlobName) {
        throw new Error(`Invalid blob path for document ${id_documento}`);
      }
      
      const blobName = decodeURIComponent(encodedBlobName);
      this.logger.debug(`Attempting to download blob: ${blobName}`);

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      
      const exists = await blockBlobClient.exists();
      if (!exists) {
        throw new Error(`File not found in Azure Storage for document ${id_documento}. BlobName: ${blobName}`);
      }

      const downloadResponse = await blockBlobClient.download();
      
      if (!downloadResponse.readableStreamBody) {
        throw new Error(`Unable to download file for document ${id_documento}`);
      }

      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      let filename: string;
      
      if (doc.nombre_archivo) {
        filename = doc.nombre_archivo;
        this.logger.debug(`Using filename from database: ${filename}`);
        
        if (!filename.includes('.')) {
          const blobExtension = blobName.split('.').pop();
          if (blobExtension) {
            filename = `${filename}.${blobExtension}`;
          }
        }
      } else {
        const blobExtension = blobName.split('.').pop();
        const nameWithoutExt = blobName.replace(/\.[^/.]+$/, "");
        const nameWithoutTimestamp = nameWithoutExt.replace(/_\d+$/, "");
        filename = `${nameWithoutTimestamp}.${blobExtension}`;
        this.logger.debug(`Extracted filename from blob: ${filename}`);
      }

      this.logger.log(`File downloaded successfully: ${filename}`);

      return {
        buffer,
        filename,
        contentType: downloadResponse.contentType || 'application/octet-stream',
        size: downloadResponse.contentLength || buffer.length
      };
    } catch (error) {
      this.logger.error(`Download error for document ${id_documento}`, error.message);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async getFile(id_documento: string) {
    return this.prisma.documento.findUnique({
      where: { id_documento },
      include: {
        tarea: true,
        tipo_doc: true
      }
    });
  }

  async listFiles(tipo_documento?: number) {
    return this.prisma.documento.findMany({
      where: tipo_documento ? { tipo_documento } : undefined,
      include: {
        tarea: true,
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

    if (this.containerClient && doc.ruta) {
      try {
        const url = new URL(doc.ruta);
        const encodedBlobName = url.pathname.split('/').pop();

        if (encodedBlobName) {
          const blobName = decodeURIComponent(encodedBlobName);
          const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
          await blockBlobClient.delete();
          this.logger.log(`Blob deleted successfully: ${blobName}`);
        }
      } catch (error) {
        this.logger.error(`Failed to delete blob for document ${id_documento}`, error.message);
        // Continue with database deletion even if blob deletion fails
      }
    }

    return this.prisma.documento.delete({
      where: { id_documento }
    });
  }

  async getAllDocumentTypes() {
    return this.prisma.tipo_documento.findMany();
  }

  async getDocumentByTaskAndType(taskId: string, documentType: number) {
    return this.prisma.documento.findFirst({
      where: {
        id_tarea: taskId,
        tipo_documento: documentType
      },
      include: {
        tarea: true,
        tipo_doc: true
      }
    });
  }
} 