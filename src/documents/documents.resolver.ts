import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentsService } from './documents.service';
import { Document, CreateDocumentInput, TipoDocumento } from '../graphql/graphql.types';

@Resolver(() => Document)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Mutation(() => Document)
  async createDocument(
    @Args('input') input: CreateDocumentInput
  ) {
    return this.documentsService.createDocumentMetadata(input);
  }

  @Query(() => [Document])
  async documents(@Args('tipo_documento', { nullable: true }) tipo_documento?: number) {
    return this.documentsService.listFiles(tipo_documento);
  }

  @Query(() => Document)
  async document(@Args('id_documento') id_documento: string) {
    const doc = await this.documentsService.getFile(id_documento);
    return doc;
  }

  @Mutation(() => Boolean)
  async deleteDocument(@Args('id_documento') id_documento: string) {
    await this.documentsService.deleteFile(id_documento);
    return true;
  }

  @Query(() => [TipoDocumento])
  async getAllDocumentTypes() {
    return this.documentsService.getAllDocumentTypes();
  }

  @Query(() => Document, { nullable: true })
  async documentByTaskAndType(
    @Args('taskId') taskId: string,
    @Args('documentType', { type: () => Int }) documentType: number
  ) {
    return this.documentsService.getDocumentByTaskAndType(taskId, documentType);
  }
} 