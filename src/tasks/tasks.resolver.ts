import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task, Subtask } from '../graphql/graphql.types';
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

  @Query(() => [Subtask])
  async taskSubtasks(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTaskSubtasks(id);
  }

  @Query(() => Float)
  async taskProgress(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTaskProgress(id);
  }
  
  @Query(() => Float)
  async taskTotalBudget(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTotalBudget(id);
  }
  
  @Query(() => Float)
  async taskTotalExpense(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTotalExpense(id);
  }

  @Query(() => Int)
  async valleyTasksCount(@Args('valleyId', { type: () => Int }) valleyId: number) {
    return this.tasksService.getValleyTasksCount(valleyId);
  }
} 