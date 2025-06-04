import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task, Subtask, Valley, Faena, MonthlyBudget, MonthlyExpense, TaskStatus, Process } from '../graphql/graphql.types';
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

  @Query(() => [Process])
  processes() {
    return this.tasksService.getAllProcesses();
  }

  @Query(() => [Task])
  tasksByProcess(@Args('processId', { type: () => Int }) processId: number) {
    return this.tasksService.getTasksByProcess(processId);
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

  @Query(() => [Subtask])
  async valleySubtasks(@Args('valleyId', { type: () => Int }) valleyId: number) {
    return this.tasksService.getValleySubtasks(valleyId);
  }

  @Query(() => Float)
  async totalBudgetByMonth(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getTotalBudgetByMonth(monthName, year);
  }

  @Query(() => Float)
  async totalExpenseByMonth(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getTotalExpenseByMonth(monthName, year);
  }

  @Query(() => Float)
  async totalBudgetByMonthAndValley(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number,
    @Args('valleyId', { type: () => Int }) valleyId: number
  ) {
    return this.tasksService.getTotalBudgetByMonthAndValley(monthName, year, valleyId);
  }

  @Query(() => Float)
  async totalExpenseByMonthAndValley(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number,
    @Args('valleyId', { type: () => Int }) valleyId: number
  ) {
    return this.tasksService.getTotalExpenseByMonthAndValley(monthName, year, valleyId);
  }

  @Query(() => [Task])
  async tasksByValley(@Args('valleyId', { type: () => Int }) valleyId: number) {
    return this.tasksService.getTasksByValley(valleyId);
  }

  @Query(() => Int)
  async valleyInvestmentTasksCount(
    @Args('valleyId', { type: () => Int }) valleyId: number,
    @Args('investmentId', { type: () => Int }) investmentId: number
  ) {
    return this.tasksService.getValleyInvestmentTasksCount(valleyId, investmentId);
  }

  @Query(() => [Valley])
  async valleys() {
    return this.tasksService.getAllValleys();
  }

  @Query(() => [Faena])
  async faenas() {
    return this.tasksService.getAllFaenas();
  }

  @Query(() => [MonthlyBudget])
  async valleyMonthlyBudgets(
    @Args('valleyId', { type: () => Int }) valleyId: number,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getValleyMonthlyBudgets(valleyId, year);
  }

  @Query(() => [MonthlyExpense])
  async valleyMonthlyExpenses(
    @Args('valleyId', { type: () => Int }) valleyId: number,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getValleyMonthlyExpenses(valleyId, year);
  }

  @Query(() => [TaskStatus])
  async taskStatuses() {
    return this.tasksService.getAllTaskStatuses();
  }

  @Query(() => [Task])
  async tasksByValleyAndStatus(
    @Args('valleyId', { type: () => Int }) valleyId: number,
    @Args('statusId', { type: () => Int }) statusId: number
  ) {
    return this.tasksService.getTasksByValleyAndStatus(valleyId, statusId);
  }

  @Query(() => [Task])
  async tasksByProcessAndValley(
    @Args('processId', { type: () => Int }) processId: number,
    @Args('valleyId', { type: () => Int }) valleyId: number
  ) {
    return this.tasksService.getTasksByProcessAndValley(processId, valleyId);
  }

  @Query(() => [Task])
  async tasksByProcessAndStatus(
    @Args('processId', { type: () => Int }) processId: number,
    @Args('statusId', { type: () => Int }) statusId: number
  ) {
    return this.tasksService.getTasksByProcessAndStatus(processId, statusId);
  }

  @Query(() => [Subtask])
  async subtasksByProcess(@Args('processId', { type: () => Int }) processId: number) {
    return this.tasksService.getSubtasksByProcess(processId);
  }

  @Query(() => [Task])
  async tasksByProcessWithCompliance(@Args('processId', { type: () => Int }) processId: number) {
    return this.tasksService.getTasksByProcessWithCompliance(processId);
  }
}