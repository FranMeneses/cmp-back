import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { HistoryService } from './history.service';
import { History } from '../graphql/graphql.types';

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
} 