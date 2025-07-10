import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { InfoService } from './info.service';
import { InfoTask, Origin, Investment, Type, Scope, Interaction, Risk } from '../graphql/graphql.types';
import { CreateInfoTaskInput, UpdateInfoTaskInput } from '../graphql/graphql.types';

/**
 * Resolver GraphQL para operaciones de información complementaria y metadatos de tareas.
 * 
 * @description Proporciona la API GraphQL completa para:
 * - CRUD de información clasificatoria asociada a tareas
 * - Catálogos de 6 categorías: Origins, Investments, Types, Scopes, Interactions, Risks
 * - Filtros especializados para obtener tareas por cada categoría
 * - Contadores estadísticos de tareas por categoría para dashboards
 * - Consultas analíticas y de información específica por tarea
 * - Operaciones públicas sin restricciones de roles
 * - Integración completa entre información y clasificaciones
 * 
 * @class InfoResolver
 * @since 1.0.0
 */
@Resolver(() => InfoTask)
export class InfoResolver {
  constructor(private readonly infoService: InfoService) {}

  // Info Task CRUD
  /**
   * Crea un nuevo registro de información para una tarea.
   * 
   * @param createInfoTaskInput - Datos de información a crear
   * @returns Información creada con todas las categorías incluidas
   */
  @Mutation(() => InfoTask)
  createInfoTask(@Args('createInfoTaskInput') createInfoTaskInput: CreateInfoTaskInput) {
    return this.infoService.create(createInfoTaskInput);
  }

  /**
   * Obtiene la lista completa de información de tareas.
   * 
   * @returns Lista de toda la información con categorías y relaciones
   */
  @Query(() => [InfoTask])
  infoTasks() {
    return this.infoService.findAll();
  }

  /**
   * Busca un registro de información específico por ID.
   * 
   * @param id - ID único del registro de información
   * @returns Información encontrada con todas las relaciones
   */
  @Query(() => InfoTask)
  infoTask(@Args('id', { type: () => ID }) id: string) {
    return this.infoService.findOne(id);
  }

  /**
   * Actualiza un registro de información existente.
   * 
   * @param id - ID del registro de información a actualizar
   * @param updateInfoTaskInput - Nuevos datos de información
   * @returns Información actualizada
   */
  @Mutation(() => InfoTask)
  updateInfoTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateInfoTaskInput') updateInfoTaskInput: UpdateInfoTaskInput,
  ) {
    return this.infoService.update(id, updateInfoTaskInput);
  }

  /**
   * Elimina un registro de información del sistema.
   * 
   * @param id - ID del registro de información a eliminar
   * @returns Información eliminada con sus datos previos
   */
  @Mutation(() => InfoTask)
  removeInfoTask(@Args('id', { type: () => ID }) id: string) {
    return this.infoService.remove(id);
  }

  /**
   * Obtiene la información asociada a una tarea específica.
   * 
   * @param id - ID de la tarea
   * @returns Información de la tarea con todas las categorías
   */
  @Query(() => InfoTask)
  async taskInfo(@Args('id', { type: () => ID }) id: string) {
    return this.infoService.getTaskInfo(id);
  }

  /**
   * Cuenta las tareas asociadas a una línea de inversión.
   * 
   * @param investmentId - ID de la línea de inversión
   * @returns Número total de tareas en la inversión
   */
  @Query(() => Int)
  async investmentTasksCount(@Args('investmentId', { type: () => Int }) investmentId: number) {
    return this.infoService.getInvestmentTasksCount(investmentId);
  }

  // Métodos para obtener tareas por categoría - Filtros
  /**
   * Filtra tareas por origen específico.
   * 
   * @param originId - ID del origen
   * @returns Lista de información de tareas del origen especificado
   */
  @Query(() => [InfoTask])
  async tasksByOrigin(@Args('originId', { type: () => Int }) originId: number) {
    return this.infoService.getTasksByOrigin(originId);
  }

  /**
   * Filtra tareas por línea de inversión específica.
   * 
   * @param investmentId - ID de la línea de inversión
   * @returns Lista de información de tareas de la inversión especificada
   */
  @Query(() => [InfoTask])
  async tasksByInvestment(@Args('investmentId', { type: () => Int }) investmentId: number) {
    return this.infoService.getTasksByInvestment(investmentId);
  }

  /**
   * Filtra tareas por tipo específico.
   * 
   * @param typeId - ID del tipo de tarea
   * @returns Lista de información de tareas del tipo especificado
   */
  @Query(() => [InfoTask])
  async tasksByType(@Args('typeId', { type: () => Int }) typeId: number) {
    return this.infoService.getTasksByType(typeId);
  }

  /**
   * Filtra tareas por alcance específico.
   * 
   * @param scopeId - ID del alcance
   * @returns Lista de información de tareas del alcance especificado
   */
  @Query(() => [InfoTask])
  async tasksByScope(@Args('scopeId', { type: () => Int }) scopeId: number) {
    return this.infoService.getTasksByScope(scopeId);
  }

  /**
   * Filtra tareas por tipo de interacción específico.
   * 
   * @param interactionId - ID del tipo de interacción
   * @returns Lista de información de tareas de la interacción especificada
   */
  @Query(() => [InfoTask])
  async tasksByInteraction(@Args('interactionId', { type: () => Int }) interactionId: number) {
    return this.infoService.getTasksByInteraction(interactionId);
  }

  /**
   * Filtra tareas por tipo de riesgo específico.
   * 
   * @param riskId - ID del tipo de riesgo
   * @returns Lista de información de tareas del riesgo especificado
   */
  @Query(() => [InfoTask])
  async tasksByRisk(@Args('riskId', { type: () => Int }) riskId: number) {
    return this.infoService.getTasksByRisk(riskId);
  }

  // Métodos contadores por categoría - Estadísticas
  /**
   * Cuenta las tareas asociadas a un origen específico.
   * 
   * @param originId - ID del origen
   * @returns Número total de tareas del origen
   */
  @Query(() => Int)
  async originTasksCount(@Args('originId', { type: () => Int }) originId: number) {
    return this.infoService.getOriginTasksCount(originId);
  }

  /**
   * Cuenta las tareas asociadas a un tipo específico.
   * 
   * @param typeId - ID del tipo de tarea
   * @returns Número total de tareas del tipo
   */
  @Query(() => Int)
  async typeTasksCount(@Args('typeId', { type: () => Int }) typeId: number) {
    return this.infoService.getTypeTasksCount(typeId);
  }

  /**
   * Cuenta las tareas asociadas a un alcance específico.
   * 
   * @param scopeId - ID del alcance
   * @returns Número total de tareas del alcance
   */
  @Query(() => Int)
  async scopeTasksCount(@Args('scopeId', { type: () => Int }) scopeId: number) {
    return this.infoService.getScopeTasksCount(scopeId);
  }

  /**
   * Cuenta las tareas asociadas a un tipo de interacción específico.
   * 
   * @param interactionId - ID del tipo de interacción
   * @returns Número total de tareas de la interacción
   */
  @Query(() => Int)
  async interactionTasksCount(@Args('interactionId', { type: () => Int }) interactionId: number) {
    return this.infoService.getInteractionTasksCount(interactionId);
  }

  /**
   * Cuenta las tareas asociadas a un tipo de riesgo específico.
   * 
   * @param riskId - ID del tipo de riesgo
   * @returns Número total de tareas del riesgo
   */
  @Query(() => Int)
  async riskTasksCount(@Args('riskId', { type: () => Int }) riskId: number) {
    return this.infoService.getRiskTasksCount(riskId);
  }

  // Catálogos de categorías clasificatorias
  /**
   * Obtiene el catálogo completo de orígenes disponibles.
   * 
   * @returns Lista de todos los orígenes con ID y nombre
   */
  @Query(() => [Origin])
  async origins() {
    return this.infoService.findAllOrigins();
  }

  /**
   * Busca un origen específico por ID.
   * 
   * @param id - ID del origen
   * @returns Origen encontrado con sus detalles
   */
  @Query(() => Origin)
  async origin(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneOrigin(id);
  }

  /**
   * Obtiene el catálogo completo de líneas de inversión.
   * 
   * @returns Lista de todas las inversiones con ID y línea
   */
  @Query(() => [Investment])
  async investments() {
    return this.infoService.findAllInvestments();
  }

  /**
   * Busca una línea de inversión específica por ID.
   * 
   * @param id - ID de la inversión
   * @returns Inversión encontrada con sus detalles
   */
  @Query(() => Investment)
  async investment(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneInvestment(id);
  }

  /**
   * Obtiene el catálogo completo de tipos de tarea.
   * 
   * @returns Lista de todos los tipos con ID y nombre
   */
  @Query(() => [Type])
  async types() {
    return this.infoService.findAllTypes();
  }

  /**
   * Busca un tipo de tarea específico por ID.
   * 
   * @param id - ID del tipo
   * @returns Tipo encontrado con sus detalles
   */
  @Query(() => Type)
  async type(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneType(id);
  }

  /**
   * Obtiene el catálogo completo de alcances de ejecución.
   * 
   * @returns Lista de todos los alcances con ID y nombre
   */
  @Query(() => [Scope])
  async scopes() {
    return this.infoService.findAllScopes();
  }

  /**
   * Busca un alcance específico por ID.
   * 
   * @param id - ID del alcance
   * @returns Alcance encontrado con sus detalles
   */
  @Query(() => Scope)
  async scope(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneScope(id);
  }

  /**
   * Obtiene el catálogo completo de tipos de interacción.
   * 
   * @returns Lista de todas las interacciones con ID y operación
   */
  @Query(() => [Interaction])
  async interactions() {
    return this.infoService.findAllInteractions();
  }

  /**
   * Busca un tipo de interacción específico por ID.
   * 
   * @param id - ID de la interacción
   * @returns Interacción encontrada con sus detalles
   */
  @Query(() => Interaction)
  async interaction(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneInteraction(id);
  }

  /**
   * Obtiene el catálogo completo de tipos de riesgo.
   * 
   * @returns Lista de todos los riesgos con ID y tipo
   */
  @Query(() => [Risk])
  async risks() {
    return this.infoService.findAllRisks();
  }

  /**
   * Busca un tipo de riesgo específico por ID.
   * 
   * @param id - ID del riesgo
   * @returns Riesgo encontrado con sus detalles
   */
  @Query(() => Risk)
  async risk(@Args('id', { type: () => Int }) id: number) {
    return this.infoService.findOneRisk(id);
  }
} 