import { Injectable } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentInput } from '../graphql/graphql.types';

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
      // Usar el nombre original del archivo con timestamp para evitar conflictos
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
      const blobName = `${fileNameWithoutExt}_${timestamp}.${fileExtension}`;
      
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: file.mimetype || 'application/octet-stream',
          blobContentDisposition: `attachment; filename="${file.originalname}"`,
        }
      };

      await blockBlobClient.upload(file.buffer, file.buffer.length, uploadOptions);
      
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
      console.log(`Downloading document ${id_documento}`);
      console.log(`Document ruta: ${doc.ruta}`);
      
      const url = new URL(doc.ruta);
      const encodedBlobName = url.pathname.split('/').pop();
      
      if (!encodedBlobName) {
        throw new Error(`Invalid blob path for document ${id_documento}`);
      }
      
      const blobName = decodeURIComponent(encodedBlobName);

      console.log(`Encoded blobName: ${encodedBlobName}`);
      console.log(`Decoded blobName: ${blobName}`);

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      
      // Verificar que el blob existe
      console.log(`Checking if blob exists: ${blobName}`);
      const exists = await blockBlobClient.exists();
      console.log(`Blob exists: ${exists}`);
      
      if (!exists) {
        throw new Error(`File not found in Azure Storage for document ${id_documento}. BlobName: ${blobName}`);
      }

      // Obtener el buffer del archivo
      const downloadResponse = await blockBlobClient.download();
      
      if (!downloadResponse.readableStreamBody) {
        throw new Error(`Unable to download file for document ${id_documento}`);
      }

      // Convertir stream a buffer
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      // Determinar el nombre del archivo con extensión
      let filename: string;
      
      console.log(`Document nombre_archivo from DB: ${doc.nombre_archivo}`);
      console.log(`BlobName for filename extraction: ${blobName}`);
      
      if (doc.nombre_archivo) {
        filename = doc.nombre_archivo;
        console.log(`Using nombre_archivo from DB: ${filename}`);
        
        if (!filename.includes('.')) {
          const blobExtension = blobName.split('.').pop();
          if (blobExtension) {
            filename = `${filename}.${blobExtension}`;
            console.log(`Added extension to filename: ${filename}`);
          }
        }
      } else {
        console.log(`No nombre_archivo in DB, extracting from blobName`);
        const blobExtension = blobName.split('.').pop();
        const nameWithoutExt = blobName.replace(/\.[^/.]+$/, ""); // Remover extensión
        const nameWithoutTimestamp = nameWithoutExt.replace(/_\d+$/, ""); // Remover timestamp
        filename = `${nameWithoutTimestamp}.${blobExtension}`;
        console.log(`Extracted filename: ${filename}`);
        console.log(`  - blobExtension: ${blobExtension}`);
        console.log(`  - nameWithoutExt: ${nameWithoutExt}`);
        console.log(`  - nameWithoutTimestamp: ${nameWithoutTimestamp}`);
      }

      console.log(`Final filename: ${filename}`);

      return {
        buffer,
        filename,
        contentType: downloadResponse.contentType || 'application/octet-stream',
        size: downloadResponse.contentLength || buffer.length
      };
    } catch (error) {
      console.error(`Download error for document ${id_documento}:`, error);
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