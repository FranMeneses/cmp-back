import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task, Subtask, Valley, Faena, MonthlyBudget, MonthlyExpense, TaskStatus, Process } from '../graphql/graphql.types';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/**
 * Resolver GraphQL para la gestión de tareas del sistema.
 * 
 * @description Proporciona acceso GraphQL a:
 * - CRUD completo de tareas
 * - Consultas de análisis financiero y progreso
 * - Reportes por valle, proceso, faena y período
 * - Catálogos de entidades relacionadas
 * - Estadísticas y métricas de gestión
 * - Consultas complejas con múltiples filtros
 * 
 * @class TasksResolver
 * @resolver Task
 * @since 1.0.0
 */
@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Obtiene todas las tareas del sistema.
   * 
   * @returns {Promise<Task[]>} Array de todas las tareas con relaciones
   */
  @Query(() => [Task])
  tasks() {
    return this.tasksService.findAll();
  }

  /**
   * Busca una tarea específica por su ID.
   * 
   * @param {string} id - ID único de la tarea
   * @returns {Promise<Task>} Tarea encontrada con relaciones
   */
  @Query(() => Task)
  task(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.findOne(id);
  }

  /**
   * Crea una nueva tarea en el sistema.
   * 
   * @param {CreateTaskDto} input - Datos de la tarea a crear
   * @returns {Promise<Task>} Tarea creada con validación de duplicados
   * 
   * @throws {BadRequestException} Si existe duplicado o datos inválidos
   */
  @Mutation(() => Task)
  createTask(@Args('input') input: CreateTaskDto) {
    return this.tasksService.create(input);
  }

  /**
   * Actualiza una tarea existente.
   * 
   * @param {string} id - ID de la tarea a actualizar
   * @param {UpdateTaskDto} input - Datos a actualizar
   * @returns {Promise<Task>} Tarea actualizada
   */
  @Mutation(() => Task)
  updateTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTaskDto
  ) {
    return this.tasksService.update(id, input);
  }

  /**
   * Elimina una tarea y todas sus dependencias del sistema.
   * 
   * @description Elimina en transacción: documentos, compliance, subtareas y la tarea.
   * 
   * @param {string} id - ID de la tarea a eliminar
   * @returns {Promise<Task>} Tarea eliminada
   * 
   * @throws {Error} Si la tarea no existe
   */
  @Mutation(() => Task)
  removeTask(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.remove(id);
  }

  /**
   * Obtiene catálogo completo de procesos empresariales.
   * 
   * @returns {Promise<Process[]>} Array de todos los procesos disponibles
   */
  @Query(() => [Process])
  processes() {
    return this.tasksService.getAllProcesses();
  }

  /**
   * Obtiene todas las tareas asociadas a un proceso específico.
   * 
   * @param {number} processId - ID del proceso
   * @returns {Promise<Task[]>} Array de tareas del proceso
   */
  @Query(() => [Task])
  tasksByProcess(@Args('processId', { type: () => Int }) processId: number) {
    return this.tasksService.getTasksByProcess(processId);
  }

  /**
   * Obtiene todas las subtareas asociadas a una tarea específica.
   * 
   * @param {string} id - ID de la tarea padre
   * @returns {Promise<Subtask[]>} Array de subtareas de la tarea
   */
  @Query(() => [Subtask])
  async taskSubtasks(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTaskSubtasks(id);
  }

  /**
   * Calcula el progreso promedio de una tarea basado en sus subtareas.
   * 
   * @param {string} id - ID de la tarea
   * @returns {Promise<number>} Porcentaje de progreso (0-100)
   */
  @Query(() => Float)
  async taskProgress(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTaskProgress(id);
  }
  
  /**
   * Calcula el presupuesto total de una tarea sumando presupuestos de subtareas.
   * 
   * @param {string} id - ID de la tarea
   * @returns {Promise<number>} Presupuesto total
   */
  @Query(() => Float)
  async taskTotalBudget(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTotalBudget(id);
  }
  
  /**
   * Calcula el gasto total real de una tarea sumando gastos de subtareas.
   * 
   * @param {string} id - ID de la tarea
   * @returns {Promise<number>} Gasto total
   */
  @Query(() => Float)
  async taskTotalExpense(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.getTotalExpense(id);
  }

  /**
   * Cuenta el número total de tareas asignadas a un valle específico.
   * 
   * @param {number} valleyId - ID del valle
   * @returns {Promise<number>} Cantidad de tareas del valle
   */
  @Query(() => Int)
  async valleyTasksCount(@Args('valleyId', { type: () => Int }) valleyId: number) {
    return this.tasksService.getValleyTasksCount(valleyId);
  }

  /**
   * Obtiene todas las subtareas de todas las tareas de un valle específico.
   * 
   * @param {number} valleyId - ID del valle
   * @returns {Promise<Subtask[]>} Array de subtareas del valle
   */
  @Query(() => [Subtask])
  async valleySubtasks(@Args('valleyId', { type: () => Int }) valleyId: number) {
    return this.tasksService.getValleySubtasks(valleyId);
  }

  /**
   * Calcula presupuesto total de subtareas que inician en un mes específico.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @returns {Promise<number>} Presupuesto total del mes
   */
  @Query(() => Float)
  async totalBudgetByMonth(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getTotalBudgetByMonth(monthName, year);
  }

  /**
   * Calcula gasto total de subtareas que inician en un mes específico.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @returns {Promise<number>} Gasto total del mes
   */
  @Query(() => Float)
  async totalExpenseByMonth(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getTotalExpenseByMonth(monthName, year);
  }

  /**
   * Calcula presupuesto total filtrado por mes y proceso específicos.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @param {number} processId - ID del proceso a filtrar
   * @returns {Promise<number>} Presupuesto total del mes y proceso
   */
  @Query(() => Float)
  async totalBudgetByMonthAndProcess(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number,
    @Args('processId', { type: () => Int }) processId: number
  ) {
    return this.tasksService.getTotalBudgetByMonthAndProcess(monthName, year, processId);
  }

  /**
   * Calcula gasto total filtrado por mes y proceso específicos.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @param {number} processId - ID del proceso a filtrar
   * @returns {Promise<number>} Gasto total del mes y proceso
   */
  @Query(() => Float)
  async totalExpenseByMonthAndProcess(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number,
    @Args('processId', { type: () => Int }) processId: number
  ) {
    return this.tasksService.getTotalExpenseByMonthAndProcess(monthName, year, processId);
  }

  /**
   * Obtiene todas las tareas asignadas a un valle específico.
   * 
   * @param {number} valleyId - ID del valle
   * @returns {Promise<Task[]>} Array de tareas del valle
   */
  @Query(() => [Task])
  async tasksByValley(@Args('valleyId', { type: () => Int }) valleyId: number) {
    return this.tasksService.getTasksByValley(valleyId);
  }

  /**
   * Cuenta tareas de un valle asociadas a una inversión específica.
   * 
   * @param {number} valleyId - ID del valle
   * @param {number} investmentId - ID de la inversión
   * @returns {Promise<number>} Cantidad de tareas que coinciden
   */
  @Query(() => Int)
  async valleyInvestmentTasksCount(
    @Args('valleyId', { type: () => Int }) valleyId: number,
    @Args('investmentId', { type: () => Int }) investmentId: number
  ) {
    return this.tasksService.getValleyInvestmentTasksCount(valleyId, investmentId);
  }

  /**
   * Obtiene catálogo completo de valles disponibles.
   * 
   * @returns {Promise<Valley[]>} Array de todos los valles
   */
  @Query(() => [Valley])
  async valleys() {
    return this.tasksService.getAllValleys();
  }

  /**
   * Obtiene catálogo completo de faenas disponibles.
   * 
   * @returns {Promise<Faena[]>} Array de todas las faenas
   */
  @Query(() => [Faena])
  async faenas() {
    return this.tasksService.getAllFaenas();
  }

  /**
   * Genera reporte de presupuestos mensuales para un proceso específico.
   * 
   * @param {number} processId - ID del proceso
   * @param {number} year - Año de consulta
   * @returns {Promise<MonthlyBudget[]>} Array con presupuesto por mes
   */
  @Query(() => [MonthlyBudget])
  async processMonthlyBudgets(
    @Args('processId', { type: () => Int }) processId: number,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getProcessMonthlyBudgets(processId, year);
  }

  /**
   * Genera reporte de gastos mensuales para un proceso específico.
   * 
   * @param {number} processId - ID del proceso
   * @param {number} year - Año de consulta
   * @returns {Promise<MonthlyExpense[]>} Array con gastos por mes
   */
  @Query(() => [MonthlyExpense])
  async processMonthlyExpenses(
    @Args('processId', { type: () => Int }) processId: number,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getProcessMonthlyExpenses(processId, year);
  }

  /**
   * Obtiene catálogo completo de estados de tareas disponibles.
   * 
   * @returns {Promise<TaskStatus[]>} Array de todos los estados de tareas
   */
  @Query(() => [TaskStatus])
  async taskStatuses() {
    return this.tasksService.getAllTaskStatuses();
  }

  /**
   * Obtiene tareas filtradas por valle y estado específicos.
   * 
   * @param {number} valleyId - ID del valle
   * @param {number} statusId - ID del estado
   * @returns {Promise<Task[]>} Array de tareas que coinciden con los filtros
   */
  @Query(() => [Task])
  async tasksByValleyAndStatus(
    @Args('valleyId', { type: () => Int }) valleyId: number,
    @Args('statusId', { type: () => Int }) statusId: number
  ) {
    return this.tasksService.getTasksByValleyAndStatus(valleyId, statusId);
  }

  /**
   * Obtiene tareas filtradas por proceso y valle específicos.
   * 
   * @param {number} processId - ID del proceso
   * @param {number} valleyId - ID del valle
   * @returns {Promise<Task[]>} Array de tareas que coinciden con los filtros
   */
  @Query(() => [Task])
  async tasksByProcessAndValley(
    @Args('processId', { type: () => Int }) processId: number,
    @Args('valleyId', { type: () => Int }) valleyId: number
  ) {
    return this.tasksService.getTasksByProcessAndValley(processId, valleyId);
  }

  /**
   * Obtiene tareas filtradas por proceso y estado específicos.
   * 
   * @param {number} processId - ID del proceso
   * @param {number} statusId - ID del estado
   * @returns {Promise<Task[]>} Array de tareas que coinciden con los filtros
   */
  @Query(() => [Task])
  async tasksByProcessAndStatus(
    @Args('processId', { type: () => Int }) processId: number,
    @Args('statusId', { type: () => Int }) statusId: number
  ) {
    return this.tasksService.getTasksByProcessAndStatus(processId, statusId);
  }

  /**
   * Obtiene todas las subtareas de tareas asociadas a un proceso específico.
   * 
   * @param {number} processId - ID del proceso
   * @returns {Promise<Subtask[]>} Array de subtareas del proceso
   */
  @Query(() => [Subtask])
  async subtasksByProcess(@Args('processId', { type: () => Int }) processId: number) {
    return this.tasksService.getSubtasksByProcess(processId);
  }

  /**
   * Obtiene tareas filtradas por mes y año específicos.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @returns {Promise<Task[]>} Array de tareas del mes/año
   */
  @Query(() => [Task])
  async tasksByMonth(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number
  ) {
    return this.tasksService.getTasksByMonth(monthName, year);
  }

  /**
   * Obtiene tareas filtradas por mes, año y proceso específicos.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @param {number} processId - ID del proceso
   * @returns {Promise<Task[]>} Array de tareas del mes/año/proceso
   */
  @Query(() => [Task])
  async tasksByMonthAndProcess(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number,
    @Args('processId', { type: () => Int }) processId: number
  ) {
    return this.tasksService.getTasksByMonthAndProcess(monthName, year, processId);
  }

  /**
   * Obtiene tareas de un proceso que tienen registros de compliance asociados.
   * 
   * @param {number} processId - ID del proceso
   * @returns {Promise<Task[]>} Array de tareas con compliance del proceso
   */
  @Query(() => [Task])
  async tasksByProcessWithCompliance(@Args('processId', { type: () => Int }) processId: number) {
    return this.tasksService.getTasksByProcessWithCompliance(processId);
  }
}