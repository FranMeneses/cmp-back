import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HistoryService {
  private containerClient: ContainerClient;
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
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
        this.logger.log('Azure Storage client initialized successfully for history documents');
      } catch (error) {
        this.logger.error('Failed to initialize Azure Storage client for history', error.message);
        this.containerClient = null;
      }
    } else {
      this.logger.warn('Azure Storage not configured - history document downloads will not work');
      this.containerClient = null;
    }
  }

  private mapToGraphql(history: any) {
    return {
      id: history.id_historial,
      name: history.nombre,
      processId: history.id_proceso,
      finalDate: history.fecha_final,
      totalExpense: history.gasto_total,
      valleyId: history.id_valle,
      faenaId: history.id_faena,
      beneficiaryId: history.beneficiario,
      solpedMemoSap: history.SOLPED_MEMO_SAP,
      hesHemSap: history.HES_HEM_SAP,
      process: history.proceso ? {
        id: history.proceso.id_proceso,
        name: history.proceso.proceso_name
      } : null,
      valley: history.valle ? {
        id: history.valle.id_valle,
        name: history.valle.valle_name
      } : null,
      faena: history.faena ? {
        id: history.faena.id_faena,
        name: history.faena.faena_name
      } : null,
      beneficiary: history.beneficiario_rel ? {
        id: history.beneficiario_rel.id_beneficiario,
        legalName: history.beneficiario_rel.nombre_legal,
        rut: history.beneficiario_rel.rut,
        address: history.beneficiario_rel.direccion,
        entityType: history.beneficiario_rel.tipo_entidad,
        representative: history.beneficiario_rel.representante,
        hasLegalPersonality: history.beneficiario_rel.personalidad_juridica
      } : null,
      documents: history.historial_doc?.map(doc => ({
        id: doc.id_his_doc,
        historyId: doc.id_historial,
        fileName: doc.nombre_archivo,
        documentTypeId: doc.tipo_documento,
        path: doc.ruta,
        uploadDate: doc.fecha_carga,
        documentType: doc.tipo_doc ? {
          id: doc.tipo_doc.id_tipo_documento,
          tipo_documento: doc.tipo_doc.tipo_documento
        } : null
      })) || []
    };
  }

  async findAll() {
    const histories = await this.prisma.historial.findMany({
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  async findOne(id: string) {
    const history = await this.prisma.historial.findUnique({
      where: { id_historial: id },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      }
    });
    return history ? this.mapToGraphql(history) : null;
  }

  async findByProcess(processId: number) {
    const histories = await this.prisma.historial.findMany({
      where: { id_proceso: processId },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  async findByValley(valleyId: number) {
    const histories = await this.prisma.historial.findMany({
      where: { id_valle: valleyId },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  async findByFaena(faenaId: number) {
    const histories = await this.prisma.historial.findMany({
      where: { id_faena: faenaId },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  async findByBeneficiary(beneficiaryId: string) {
    const histories = await this.prisma.historial.findMany({
      where: { beneficiario: beneficiaryId },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  /**
   * Descarga un documento histórico desde Azure Blob Storage
   * Los documentos históricos reutilizan las mismas URLs del blob que los documentos originales
   */
  async downloadHistoryDocument(id_his_doc: string) {
    if (!this.containerClient) {
      throw new Error('Azure Storage is not configured. Cannot download history documents.');
    }
    
    const historyDoc = await this.prisma.historial_doc.findUnique({
      where: { id_his_doc },
      include: {
        tipo_doc: true,
        historial: true
      }
    });

    if (!historyDoc) {
      throw new Error(`History document with ID ${id_his_doc} not found`);
    }

    if (!historyDoc.ruta) {
      throw new Error(`History document ${id_his_doc} has no file path`);
    }

    try {
      this.logger.debug(`Downloading history document ${id_his_doc}`);
      
      // Extraer el nombre del blob de la URL (misma lógica que DocumentsService)
      const url = new URL(historyDoc.ruta);
      const encodedBlobName = url.pathname.split('/').pop();
      
      if (!encodedBlobName) {
        throw new Error(`Invalid blob path for history document ${id_his_doc}`);
      }
      
      const blobName = decodeURIComponent(encodedBlobName);
      this.logger.debug(`Attempting to download blob: ${blobName}`);

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      
      const exists = await blockBlobClient.exists();
      if (!exists) {
        throw new Error(`File not found in Azure Storage for history document ${id_his_doc}. BlobName: ${blobName}`);
      }

      const downloadResponse = await blockBlobClient.download();
      
      if (!downloadResponse.readableStreamBody) {
        throw new Error(`Unable to download file for history document ${id_his_doc}`);
      }

      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      let filename: string;
      
      if (historyDoc.nombre_archivo) {
        filename = historyDoc.nombre_archivo;
        this.logger.debug(`Using filename from history database: ${filename}`);
        
        // Si el nombre en BD no tiene extensión, agregar la extensión del blob original
        if (!filename.includes('.')) {
          const blobExtension = blobName.split('.').pop();
          if (blobExtension) {
            filename = `${filename}.${blobExtension}`;
            this.logger.debug(`Added extension to history filename: ${filename}`);
          }
        }
      } else {
        // Fallback: reconstruir desde el blob name removiendo timestamp
        const blobExtension = blobName.split('.').pop();
        const nameWithoutExt = blobName.replace(/\.[^/.]+$/, "");
        const nameWithoutTimestamp = nameWithoutExt.replace(/_\d+$/, "");
        filename = `${nameWithoutTimestamp}.${blobExtension}`;
        this.logger.debug(`Reconstructed filename from blob for history: ${filename}`);
      }

      // Obtener el content type del blob
      const properties = await blockBlobClient.getProperties();
      const contentType = properties.contentType || 'application/octet-stream';

      this.logger.log(`Successfully downloaded history document ${id_his_doc}: ${filename}`);
      
      return {
        buffer,
        filename,
        contentType,
        size: buffer.length
      };
    } catch (error) {
      this.logger.error(`Failed to download history document ${id_his_doc}`, error.message);
      throw error;
    }
  }

  /**
   * Elimina un documento histórico completamente (blob + metadata histórica)
   */
  async deleteHistoryDocument(id_his_doc: string) {
    if (!this.containerClient) {
      throw new Error('Azure Storage is not configured. Cannot delete history documents.');
    }
    
    const historyDoc = await this.prisma.historial_doc.findUnique({
      where: { id_his_doc },
      include: {
        tipo_doc: true,
        historial: true
      }
    });

    if (!historyDoc) {
      throw new Error(`History document with ID ${id_his_doc} not found`);
    }

    // Eliminar blob de Azure Storage
    if (historyDoc.ruta) {
      try {
        const url = new URL(historyDoc.ruta);
        const encodedBlobName = url.pathname.split('/').pop();
        
        if (encodedBlobName) {
          const blobName = decodeURIComponent(encodedBlobName);
          const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
          
          const exists = await blockBlobClient.exists();
          if (exists) {
            await blockBlobClient.delete();
            this.logger.log(`History document blob deleted from Azure Storage: ${blobName}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to delete blob for history document ${id_his_doc}:`, error.message);
        // No fallar la operación si el blob no se puede eliminar
      }
    }

    // Eliminar metadata histórica de la base de datos
    await this.prisma.historial_doc.delete({
      where: { id_his_doc }
    });
    
    this.logger.log(`History document completely deleted: ${id_his_doc}`);
    
    return {
      deleted: true,
      id: id_his_doc,
      filename: historyDoc.nombre_archivo
    };
  }
} 