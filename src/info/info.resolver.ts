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

  // Métodos para obtener tareas por categoría
  @Query(() => [InfoTask])
  async tasksByOrigin(@Args('originId', { type: () => Int }) originId: number) {
    return this.infoService.getTasksByOrigin(originId);
  }

  @Query(() => [InfoTask])
  async tasksByInvestment(@Args('investmentId', { type: () => Int }) investmentId: number) {
    return this.infoService.getTasksByInvestment(investmentId);
  }

  @Query(() => [InfoTask])
  async tasksByType(@Args('typeId', { type: () => Int }) typeId: number) {
    return this.infoService.getTasksByType(typeId);
  }

  @Query(() => [InfoTask])
  async tasksByScope(@Args('scopeId', { type: () => Int }) scopeId: number) {
    return this.infoService.getTasksByScope(scopeId);
  }

  @Query(() => [InfoTask])
  async tasksByInteraction(@Args('interactionId', { type: () => Int }) interactionId: number) {
    return this.infoService.getTasksByInteraction(interactionId);
  }

  @Query(() => [InfoTask])
  async tasksByRisk(@Args('riskId', { type: () => Int }) riskId: number) {
    return this.infoService.getTasksByRisk(riskId);
  }

  // Métodos contadores por categoría
  @Query(() => Int)
  async originTasksCount(@Args('originId', { type: () => Int }) originId: number) {
    return this.infoService.getOriginTasksCount(originId);
  }

  @Query(() => Int)
  async typeTasksCount(@Args('typeId', { type: () => Int }) typeId: number) {
    return this.infoService.getTypeTasksCount(typeId);
  }

  @Query(() => Int)
  async scopeTasksCount(@Args('scopeId', { type: () => Int }) scopeId: number) {
    return this.infoService.getScopeTasksCount(scopeId);
  }

  @Query(() => Int)
  async interactionTasksCount(@Args('interactionId', { type: () => Int }) interactionId: number) {
    return this.infoService.getInteractionTasksCount(interactionId);
  }

  @Query(() => Int)
  async riskTasksCount(@Args('riskId', { type: () => Int }) riskId: number) {
    return this.infoService.getRiskTasksCount(riskId);
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