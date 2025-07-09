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
   * Sube un archivo a Azure Blob Storage y crea automáticamente los metadatos en la base de datos
   */
  async uploadFileComplete(file: Express.Multer.File, tipo_documento: number, id_tarea?: string) {
    const blobInfo = await this.uploadBlobOnly(file);
    
    // Crear automáticamente los metadatos con el nombre original completo
    const documentMetadata = await this.createDocumentMetadata({
      tipo_documento,
      ruta: blobInfo.ruta,
      id_tarea,
      nombre_archivo: file.originalname // Garantiza que se guarde con extensión
    });
    
    return {
      ...documentMetadata,
      uploadInfo: blobInfo
    };
  }

  /**
   * Sube un archivo a Azure Blob Storage sin guardar metadata en la base de datos
   * @deprecated Usar uploadFileComplete para flujo completo o mantener solo para casos específicos
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
   * Verifica si una tarea tiene registro en el historial
   */
  private async taskHasHistory(taskId: string): Promise<boolean> {
    const historyCount = await this.prisma.historial.count({
      where: {
        // Buscar por el nombre de la tarea ya que así se copia al historial
        nombre: {
          in: await this.prisma.tarea.findFirst({
            where: { id_tarea: taskId },
            select: { nombre: true }
          }).then(task => task?.nombre ? [task.nombre] : [])
        }
      }
    });
    return historyCount > 0;
  }

  /**
   * Elimina solo los metadatos del documento (mantiene el blob)
   */
  private async deleteMetadataOnly(id_documento: string) {
    await this.prisma.documento.delete({
      where: { id_documento }
    });
    this.logger.log(`Document metadata deleted (blob preserved): ${id_documento}`);
  }

  /**
   * Elimina el blob de Azure Storage y los metadatos
   */
  private async deleteBlobAndMetadata(id_documento: string) {
    const doc = await this.prisma.documento.findUnique({
      where: { id_documento }
    });

    if (!doc) {
      throw new Error(`Document ${id_documento} not found`);
    }

    // Eliminar blob de Azure Storage
    if (doc.ruta && this.containerClient) {
      try {
        const url = new URL(doc.ruta);
        const encodedBlobName = url.pathname.split('/').pop();
        
        if (encodedBlobName) {
          const blobName = decodeURIComponent(encodedBlobName);
          const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
          
          const exists = await blockBlobClient.exists();
          if (exists) {
            await blockBlobClient.delete();
            this.logger.log(`Blob deleted from Azure Storage: ${blobName}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to delete blob for document ${id_documento}:`, error.message);
        // No fallar la operación si el blob no se puede eliminar
      }
    }

    // Eliminar metadatos de la base de datos
    await this.prisma.documento.delete({
      where: { id_documento }
    });
    
    this.logger.log(`Document and blob completely deleted: ${id_documento}`);
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
        
        // Si el nombre en BD no tiene extensión, agregar la extensión del blob original
        if (!filename.includes('.')) {
          const blobExtension = blobName.split('.').pop();
          if (blobExtension) {
            filename = `${filename}.${blobExtension}`;
            this.logger.debug(`Added extension to filename: ${filename}`);
          }
        }
      } else {
        // Fallback: reconstruir desde el blob name removiendo timestamp
        const blobExtension = blobName.split('.').pop();
        const nameWithoutExt = blobName.replace(/\.[^/.]+$/, "");
        const nameWithoutTimestamp = nameWithoutExt.replace(/_\d+$/, "");
        filename = `${nameWithoutTimestamp}.${blobExtension}`;
        this.logger.debug(`Reconstructed filename from blob: ${filename}`);
      }
      
      // Validación final: asegurar que tenga extensión
      if (!filename.includes('.')) {
        const blobExtension = blobName.split('.').pop();
        if (blobExtension) {
          filename = `${filename}.${blobExtension}`;
          this.logger.warn(`Force-added extension to filename: ${filename}`);
        }
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

  /**
   * Elimina un documento aplicando la lógica de historial:
   * - Si la tarea NO tiene historial: borra blob + metadata
   * - Si la tarea SÍ tiene historial: borra solo metadata (preserva blob para historial)
   */
  async deleteFile(id_documento: string) {
    const doc = await this.prisma.documento.findUnique({
      where: { id_documento },
      include: {
        tarea: true
      }
    });

    if (!doc) {
      throw new Error(`Document with ID ${id_documento} not found`);
    }

    if (!doc.id_tarea) {
      // Documento sin tarea asociada, borrar completamente
      this.logger.warn(`Document ${id_documento} has no associated task, deleting completely`);
      await this.deleteBlobAndMetadata(id_documento);
      return { deleted: true, method: 'complete', reason: 'no_task' };
    }

    // Verificar si la tarea tiene historial
    const hasHistory = await this.taskHasHistory(doc.id_tarea);

    if (hasHistory) {
      // Tarea en historial: borrar solo metadata (preservar blob para documentos históricos)
      this.logger.log(`Task ${doc.id_tarea} has history, preserving blob for document ${id_documento}`);
      await this.deleteMetadataOnly(id_documento);
      return { deleted: true, method: 'metadata_only', reason: 'task_has_history' };
    } else {
      // Tarea sin historial: borrar blob + metadata
      this.logger.log(`Task ${doc.id_tarea} has no history, completely deleting document ${id_documento}`);
      await this.deleteBlobAndMetadata(id_documento);
      return { deleted: true, method: 'complete', reason: 'task_no_history' };
    }
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