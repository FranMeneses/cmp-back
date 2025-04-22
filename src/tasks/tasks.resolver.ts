import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task, CreateTaskInput, UpdateTaskInput } from '../graphql/graphql.types';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task])
  async tasks(@Args('query', { type: () => String, nullable: true }) query?: string) {
    return this.tasksService.findAll(query ? JSON.parse(query) : {});
  }

  @Query(() => Task)
  async task(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.findOne(id);
  }

  @Mutation(() => Task)
  async createTask(@Args('input') input: CreateTaskInput) {
    return this.tasksService.create(input);
  }

  @Mutation(() => Task)
  async updateTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTaskInput,
  ) {
    return this.tasksService.update(id, input);
  }

  @Mutation(() => Task)
  async deleteTask(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.remove(id);
  }

  @Query(() => Float)
  async taskProgress(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTaskProgress(id);
  }

  @Query(() => [Task])
  async taskSubtasks(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTaskSubtasks(id);
  }

  @Query(() => Float)
  async taskTotalBudget(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTotalBudget(id);
  }

  @Query(() => Float)
  async taskTotalExpense(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTotalExpense(id);
  }
} 