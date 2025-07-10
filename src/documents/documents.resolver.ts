import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentsService } from './documents.service';
import { Document, CreateDocumentInput, TipoDocumento } from '../graphql/graphql.types';

/**
 * Resolver GraphQL para operaciones de metadatos de documentos.
 * 
 * @description Proporciona la API GraphQL para gestión de metadatos de documentos:
 * - CRUD de metadatos de documentos (no maneja archivos físicos)
 * - Consultas especializadas por tarea y tipo de documento
 * - Catálogo de tipos de documento disponibles
 * - Operaciones públicas sin restricciones de roles
 * - Interfaz separada del upload/download de archivos (manejado por REST API)
 * - Integración transparente con Azure Blob Storage via DocumentsService
 * - Soporte para documentos asociados y no asociados a tareas
 * 
 * @class DocumentsResolver
 * @since 1.0.0
 */
@Resolver(() => Document)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Crea metadatos de un documento en el sistema.
   * 
   * @description Registra únicamente los metadatos del documento.
   * El archivo físico debe subirse previamente via API REST.
   * 
   * @param input - Datos del documento a crear
   * @returns Metadatos del documento creado con relaciones
   */
  @Mutation(() => Document)
  async createDocument(
    @Args('input') input: CreateDocumentInput
  ) {
    return this.documentsService.createDocumentMetadata(input);
  }

  /**
   * Lista documentos con filtro opcional por tipo.
   * 
   * @param tipo_documento - ID opcional del tipo de documento para filtrar
   * @returns Lista de documentos con metadatos y relaciones
   */
  @Query(() => [Document])
  async documents(@Args('tipo_documento', { nullable: true }) tipo_documento?: number) {
    return this.documentsService.listFiles(tipo_documento);
  }

  /**
   * Obtiene los metadatos de un documento específico.
   * 
   * @param id_documento - ID del documento
   * @returns Metadatos del documento con relaciones incluidas
   */
  @Query(() => Document)
  async document(@Args('id_documento') id_documento: string) {
    const doc = await this.documentsService.getFile(id_documento);
    return doc;
  }

  /**
   * Elimina un documento aplicando lógica de preservación histórica.
   * 
   * @description La eliminación puede ser parcial (solo metadatos) o completa
   * dependiendo de si la tarea asociada está en el historial del sistema.
   * 
   * @param id_documento - ID del documento a eliminar
   * @returns true si la eliminación fue exitosa
   */
  @Mutation(() => Boolean)
  async deleteDocument(@Args('id_documento') id_documento: string) {
    await this.documentsService.deleteFile(id_documento);
    return true;
  }

  /**
   * Obtiene el catálogo completo de tipos de documento.
   * 
   * @returns Lista de todos los tipos de documento disponibles
   */
  @Query(() => [TipoDocumento])
  async getAllDocumentTypes() {
    return this.documentsService.getAllDocumentTypes();
  }

  /**
   * Busca un documento específico por tarea y tipo.
   * 
   * @description Útil para verificar si una tarea ya tiene un documento
   * de un tipo específico o para recuperar documentos conocidos.
   * 
   * @param taskId - ID de la tarea
   * @param documentType - ID del tipo de documento
   * @returns Documento encontrado o null si no existe
   */
  @Query(() => Document, { nullable: true })
  async documentByTaskAndType(
    @Args('taskId') taskId: string,
    @Args('documentType', { type: () => Int }) documentType: number
  ) {
    return this.documentsService.getDocumentByTaskAndType(taskId, documentType);
  }
} 