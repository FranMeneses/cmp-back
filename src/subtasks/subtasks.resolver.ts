import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Subtask } from '../graphql/graphql.types';
import { Int } from '@nestjs/graphql';
import { Priority } from '../graphql/graphql.types';
import { SubtaskStatus } from '../graphql/graphql.types';

@Resolver(() => Subtask)
export class SubtasksResolver {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Mutation(() => Subtask)
  createSubtask(@Args('input') input: CreateSubtaskDto) {
    return this.subtasksService.create(input);
  }

  @Query(() => [Subtask])
  subtasks() {
    return this.subtasksService.findAll();
  }

  @Query(() => Subtask)
  subtask(@Args('id', { type: () => ID }) id: string) {
    return this.subtasksService.findOne(id);
  }

  @Mutation(() => Subtask)
  updateSubtask(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSubtaskDto
  ) {
    return this.subtasksService.update(id, input);
  }

  @Mutation(() => Subtask)
  removeSubtask(@Args('id', { type: () => ID }) id: string) {
    return this.subtasksService.remove(id);
  }

  @Query(() => [Priority])
  async priorities() {
    return this.subtasksService.getAllPriorities();
  }

  @Query(() => [SubtaskStatus])
  async subtaskStatuses() {
    return this.subtasksService.getAllSubtaskStatuses();
  }

  @Query(() => [Subtask])
  async subtasksByMonthYearAndProcess(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number,
    @Args('processId', { type: () => Int }) processId: number
  ) {
    return this.subtasksService.getSubtasksByMonthYearAndProcess(monthName, year, processId);
  }
} 