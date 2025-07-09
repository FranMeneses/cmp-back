import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { HistoryService } from './history.service';
import { History, DeleteHistoryDocumentResponse, DeleteHistoryResponse } from '../graphql/graphql.types';

@Resolver(() => History)
export class HistoryResolver {
  constructor(private readonly historyService: HistoryService) {}

  @Query(() => [History])
  async histories(): Promise<History[]> {
    return this.historyService.findAll();
  }

  @Query(() => History, { nullable: true })
  async history(@Args('id', { type: () => ID }) id: string): Promise<History | null> {
    return this.historyService.findOne(id);
  }

  @Query(() => [History])
  async historiesByProcess(@Args('processId', { type: () => Int }) processId: number): Promise<History[]> {
    return this.historyService.findByProcess(processId);
  }

  @Query(() => [History])
  async historiesByValley(@Args('valleyId', { type: () => Int }) valleyId: number): Promise<History[]> {
    return this.historyService.findByValley(valleyId);
  }

  @Query(() => [History])
  async historiesByFaena(@Args('faenaId', { type: () => Int }) faenaId: number): Promise<History[]> {
    return this.historyService.findByFaena(faenaId);
  }

  @Query(() => [History])
  async historiesByBeneficiary(@Args('beneficiaryId', { type: () => ID }) beneficiaryId: string): Promise<History[]> {
    return this.historyService.findByBeneficiary(beneficiaryId);
  }

  @Mutation(() => DeleteHistoryDocumentResponse)
  async deleteHistoryDocument(@Args('id', { type: () => ID }) id: string): Promise<DeleteHistoryDocumentResponse> {
    return this.historyService.deleteHistoryDocument(id);
  }

  @Mutation(() => DeleteHistoryResponse)
  async deleteHistory(@Args('id', { type: () => ID }) id: string): Promise<DeleteHistoryResponse> {
    return this.historyService.deleteHistory(id);
  }
} 