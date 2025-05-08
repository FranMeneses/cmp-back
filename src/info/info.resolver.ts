import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { InfoService } from './info.service';
import { InfoTask, Origin, Investment, Type, Scope, Interaction, Risk } from '../graphql/graphql.types';
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

  @Query(() => [Origin])
  async origins() {
    return this.infoService.findAllOrigins();
  }

  @Query(() => Origin)
  async origin(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneOrigin(id);
  }

  @Query(() => [Investment])
  async investments() {
    return this.infoService.findAllInvestments();
  }

  @Query(() => Investment)
  async investment(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneInvestment(id);
  }

  @Query(() => [Type])
  async types() {
    return this.infoService.findAllTypes();
  }

  @Query(() => Type)
  async type(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneType(id);
  }

  @Query(() => [Scope])
  async scopes() {
    return this.infoService.findAllScopes();
  }

  @Query(() => Scope)
  async scope(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneScope(id);
  }

  @Query(() => [Interaction])
  async interactions() {
    return this.infoService.findAllInteractions();
  }

  @Query(() => Interaction)
  async interaction(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneInteraction(id);
  }

  @Query(() => [Risk])
  async risks() {
    return this.infoService.findAllRisks();
  }

  @Query(() => Risk)
  async risk(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneRisk(id);
  }
} 