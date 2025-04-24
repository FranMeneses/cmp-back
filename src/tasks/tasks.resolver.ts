import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task, CreateTaskInput, UpdateTaskInput } from '../graphql/graphql.types';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task])
  tasks() {
    return this.tasksService.findAll();
  }

  @Query(() => Task)
  task(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.findOne(id);
  }

  @Mutation(() => Task)
  createTask(@Args('input') input: CreateTaskDto) {
    return this.tasksService.create(input);
  }

  @Mutation(() => Task)
  updateTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTaskDto
  ) {
    return this.tasksService.update(id, input);
  }

  @Mutation(() => Task)
  removeTask(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.remove(id);
  }

  /* Comentando temporalmente los resolvers que no son parte del CRUD básico
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
  */
} 