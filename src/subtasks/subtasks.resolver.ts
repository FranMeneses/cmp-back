import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SubtasksService } from './subtasks.service';
import { Subtask, CreateSubtaskInput, UpdateSubtaskInput } from '../graphql/graphql.types';

@Resolver(() => Subtask)
export class SubtasksResolver {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Query(() => [Subtask])
  async subtasks(@Args('query', { type: () => String, nullable: true }) query?: string) {
    return this.subtasksService.findAll(query ? JSON.parse(query) : {});
  }

  @Query(() => Subtask)
  async subtask(@Args('id', { type: () => ID }) id: string) {
    return this.subtasksService.findOne(id);
  }

  @Mutation(() => Subtask)
  async createSubtask(@Args('input') input: CreateSubtaskInput) {
    return this.subtasksService.create(input);
  }

  @Mutation(() => Subtask)
  async updateSubtask(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSubtaskInput,
  ) {
    return this.subtasksService.update(id, input);
  }

  @Mutation(() => Subtask)
  async deleteSubtask(@Args('id', { type: () => ID }) id: string) {
    return this.subtasksService.remove(id);
  }
} 