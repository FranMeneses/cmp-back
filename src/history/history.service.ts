import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de gestión completa del historial de tareas completadas con preservación de documentos.
 * 
 * @description Proporciona funcionalidades avanzadas para el manejo integral del historial del sistema:
 * - Consulta completa de registros históricos con relaciones de proceso, valle, faena y beneficiario
 * - Integración nativa con Azure Blob Storage para gestión de documentos históricos
 * - Descarga optimizada de documentos preservados con manejo Unicode y extensiones
 * - Eliminación selectiva de documentos históricos individuales o historial completo
 * - Transformación inteligente entre formatos de base de datos y GraphQL
 * - Filtros especializados por proceso, valle, faena y beneficiario
 * - Preservación de metadatos SAP (SOLPED_MEMO_SAP, HES_HEM_SAP) para auditoría
 * - Gestión de archivos con nombres originales y fallbacks inteligentes
 * - Configuración flexible con fallback para entornos sin Azure Storage
 * - Logging detallado para troubleshooting y auditoría de operaciones
 * - Manejo robusto de errores con operaciones transaccionales
 * - Soporte para limpieza masiva de registros históricos obsoletos
 * 
 * @class HistoryService
 * @since 1.0.0
 */
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

  /**
   * Transforma un registro de historial de formato de base de datos a formato GraphQL.
   * 
   * @description Mapeo completo que incluye:
   * 1. Transformación de nombres de campos de snake_case a camelCase
   * 2. Construcción de objetos relacionados (proceso, valle, faena, beneficiario)
   * 3. Mapeo de documentos históricos con información de tipo
   * 4. Preservación de metadatos SAP y fechas
   * 
   * @param history - Registro de historial con relaciones de Prisma
   * @returns Objeto History en formato GraphQL con todas las relaciones
   * 
   * @private
   * @since 1.0.0
   */
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

  /**
   * Obtiene todos los registros de historial del sistema ordenados por fecha.
   * 
   * @description Consulta completa que incluye:
   * 1. Todos los registros de la tabla historial
   * 2. Relaciones con proceso, valle, faena y beneficiario
   * 3. Documentos históricos con tipos de documento
   * 4. Ordenamiento descendente por fecha final
   * 
   * @returns Array de registros de historial en formato GraphQL
   * 
   * @since 1.0.0
   */
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

  /**
   * Busca un registro de historial específico por su ID.
   * 
   * @param id - ID único del registro de historial
   * @returns Registro de historial con relaciones o null si no existe
   * 
   * @since 1.0.0
   */
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

  /**
   * Obtiene todos los registros de historial asociados a un proceso específico.
   * 
   * @description Filtra el historial por proceso empresarial con:
   * 1. Búsqueda por ID de proceso
   * 2. Inclusión de todas las relaciones
   * 3. Ordenamiento por fecha descendente
   * 
   * @param processId - ID del proceso empresarial
   * @returns Array de registros de historial del proceso
   * 
   * @since 1.0.0
   */
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

  /**
   * Obtiene todos los registros de historial asociados a un valle específico.
   * 
   * @description Filtra el historial por valle geográfico con:
   * 1. Búsqueda por ID de valle
   * 2. Inclusión de todas las relaciones
   * 3. Ordenamiento por fecha descendente
   * 
   * @param valleyId - ID del valle
   * @returns Array de registros de historial del valle
   * 
   * @since 1.0.0
   */
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

  /**
   * Obtiene todos los registros de historial asociados a una faena específica.
   * 
   * @description Filtra el historial por faena operacional con:
   * 1. Búsqueda por ID de faena
   * 2. Inclusión de todas las relaciones
   * 3. Ordenamiento por fecha descendente
   * 
   * @param faenaId - ID de la faena
   * @returns Array de registros de historial de la faena
   * 
   * @since 1.0.0
   */
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

  /**
   * Obtiene todos los registros de historial asociados a un beneficiario específico.
   * 
   * @description Filtra el historial por beneficiario con:
   * 1. Búsqueda por ID de beneficiario
   * 2. Inclusión de todas las relaciones
   * 3. Ordenamiento por fecha descendente
   * 
   * @param beneficiaryId - ID del beneficiario
   * @returns Array de registros de historial del beneficiario
   * 
   * @since 1.0.0
   */
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
   * Descarga un documento histórico desde Azure Blob Storage.
   * 
   * @description Proceso completo de descarga de documentos preservados:
   * 1. Busca el documento histórico en la base de datos
   * 2. Extrae el nombre del blob de la URL almacenada
   * 3. Verifica existencia del archivo en Azure Storage
   * 4. Descarga el blob completo en memoria
   * 5. Reconstruye el nombre original con extensión correcta
   * 6. Aplica fallbacks inteligentes para nombres faltantes
   * 7. Obtiene propiedades del blob (content-type, etc.)
   * 
   * Los documentos históricos reutilizan las mismas URLs del blob que los documentos originales,
   * garantizando la integridad y accesibilidad de los archivos preservados.
   * 
   * @param id_his_doc - ID único del documento histórico
   * @returns Objeto con buffer, filename, contentType y size del archivo
   * 
   * @throws Error si Azure Storage no está configurado
   * @throws Error si el documento histórico no existe
   * @throws Error si el archivo no se encuentra en Azure Storage
   * 
   * @since 1.0.0
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
   * Elimina un documento histórico completamente del sistema.
   * 
   * @description Eliminación completa que incluye:
   * 1. Búsqueda del documento histórico en la base de datos
   * 2. Eliminación del blob físico de Azure Storage
   * 3. Eliminación de los metadatos de la tabla historial_doc
   * 4. Manejo graceful de errores de Azure (no falla si blob no existe)
   * 5. Logging detallado de todas las operaciones
   * 
   * Esta operación es irreversible y elimina permanentemente tanto el archivo
   * físico como sus metadatos del historial.
   * 
   * @param id_his_doc - ID único del documento histórico a eliminar
   * @returns Objeto con información de la eliminación realizada
   * 
   * @throws Error si Azure Storage no está configurado
   * @throws Error si el documento histórico no existe
   * 
   * @since 1.0.0
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

  /**
   * Elimina un registro de historial completo con todos sus documentos en cascada.
   * 
   * @description Eliminación masiva y transaccional que incluye:
   * 1. Búsqueda del registro de historial con todos sus documentos
   * 2. Eliminación iterativa de todos los blobs de Azure Storage
   * 3. Eliminación de todos los metadatos de documentos históricos
   * 4. Eliminación del registro principal del historial
   * 5. Contabilización detallada de elementos eliminados
   * 6. Manejo robusto de errores parciales (continúa eliminando otros elementos)
   * 7. Logging granular de cada operación realizada
   * 
   * Esta operación es especialmente útil para limpieza de registros históricos
   * obsoletos o corrección de datos inconsistentes.
   * 
   * @param id_historial - ID único del registro de historial a eliminar
   * @returns Objeto con estadísticas completas de la eliminación
   * 
   * @throws Error si Azure Storage no está configurado
   * @throws Error si el registro de historial no existe
   * 
   * @since 1.0.0
   */
  async deleteHistory(id_historial: string) {
    if (!this.containerClient) {
      throw new Error('Azure Storage is not configured. Cannot delete history.');
    }

    const history = await this.prisma.historial.findUnique({
      where: { id_historial },
      include: {
        historial_doc: true,
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true
      }
    });

    if (!history) {
      throw new Error(`History with ID ${id_historial} not found`);
    }

    const totalDocuments = history.historial_doc.length;
    let deletedDocuments = 0;
    let deletedBlobs = 0;

    // Eliminar todos los documentos históricos asociados
    for (const doc of history.historial_doc) {
      try {
        // Eliminar blob de Azure Storage
        if (doc.ruta) {
          try {
            const url = new URL(doc.ruta);
            const encodedBlobName = url.pathname.split('/').pop();
            
            if (encodedBlobName) {
              const blobName = decodeURIComponent(encodedBlobName);
              const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
              
              const exists = await blockBlobClient.exists();
              if (exists) {
                await blockBlobClient.delete();
                deletedBlobs++;
                this.logger.log(`History document blob deleted: ${blobName}`);
              }
            }
          } catch (error) {
            this.logger.error(`Failed to delete blob for document ${doc.id_his_doc}:`, error.message);
            // Continuar con la siguiente eliminación
          }
        }

        // Eliminar metadata del documento histórico
        await this.prisma.historial_doc.delete({
          where: { id_his_doc: doc.id_his_doc }
        });
        deletedDocuments++;
        
      } catch (error) {
        this.logger.error(`Failed to delete history document ${doc.id_his_doc}:`, error.message);
        // Continuar con la siguiente eliminación
      }
    }

    // Eliminar el registro del historial
    await this.prisma.historial.delete({
      where: { id_historial }
    });

    this.logger.log(`History completely deleted: ${id_historial} (${deletedDocuments}/${totalDocuments} documents, ${deletedBlobs} blobs)`);

    return {
      deleted: true,
      id: id_historial,
      name: history.nombre,
      totalDocuments,
      deletedDocuments,
      deletedBlobs
    };
  }
} 