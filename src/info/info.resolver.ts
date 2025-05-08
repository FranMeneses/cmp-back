import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { InfoService } from './info.service';
import { InfoTask } from '../graphql/graphql.types';
import { CreateInfoTaskInput, UpdateInfoTaskInput } from '../graphql/graphql.types';

@Resolver(() => InfoTask)
export class InfoResolver {
  constructor(private readonly infoService: InfoService) {}

  // Info Task CRUD
  @Mutation(() => InfoTask)
  createInfoTask(@Args('createInfoTaskInput') createInfoTaskInput: CreateInfoTaskInput) {
    return this.infoService.create(createInfoTaskInput);
  }

  @Query(() => [InfoTask])
  infoTasks() {
    return this.infoService.findAll();
  }

  @Query(() => InfoTask)
  infoTask(@Args('id', { type: () => ID }) id: string) {
    return this.infoService.findOne(id);
  }

  @Mutation(() => InfoTask)
  updateInfoTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateInfoTaskInput') updateInfoTaskInput: UpdateInfoTaskInput,
  ) {
    return this.infoService.update(id, updateInfoTaskInput);
  }

  @Mutation(() => InfoTask)
  removeInfoTask(@Args('id', { type: () => ID }) id: string) {
    return this.infoService.remove(id);
  }

  @Query(() => InfoTask)
  async taskInfo(@Args('id', { type: () => ID }) id: string) {
    return this.infoService.getTaskInfo(id);
  }

  @Query(() => Int)
  async investmentTasksCount(@Args('investmentId', { type: () => Int }) investmentId: number) {
    return this.infoService.getInvestmentTasksCount(investmentId);
  }
} 