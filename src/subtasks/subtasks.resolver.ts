import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Subtask } from '../graphql/graphql.types';
import { Int } from '@nestjs/graphql';
import { Priority } from '../graphql/graphql.types';
import { SubtaskStatus } from '../graphql/graphql.types';

/**
 * Resolver GraphQL para la gestión de subtareas del sistema.
 * 
 * @description Proporciona acceso GraphQL a:
 * - CRUD completo de subtareas
 * - Consultas por estado y prioridad
 * - Consultas temporales por período
 * - Catálogos de estados y prioridades
 * - Operaciones de seguimiento y control
 * 
 * @class SubtasksResolver
 * @resolver Subtask
 * @since 1.0.0
 */
@Resolver(() => Subtask)
export class SubtasksResolver {
  constructor(private readonly subtasksService: SubtasksService) {}

  /**
   * Crea una nueva subtarea en el sistema.
   * 
   * @param {CreateSubtaskDto} input - Datos de la subtarea a crear
   * @returns {Promise<Subtask>} Subtarea creada con relaciones incluidas
   */
  @Mutation(() => Subtask)
  createSubtask(@Args('input') input: CreateSubtaskDto) {
    return this.subtasksService.create(input);
  }

  /**
   * Obtiene todas las subtareas del sistema.
   * 
   * @returns {Promise<Subtask[]>} Array de todas las subtareas con relaciones
   */
  @Query(() => [Subtask])
  subtasks() {
    return this.subtasksService.findAll();
  }

  /**
   * Busca una subtarea específica por su ID.
   * 
   * @param {string} id - ID único de la subtarea
   * @returns {Promise<Subtask>} Subtarea encontrada con relaciones
   */
  @Query(() => Subtask)
  subtask(@Args('id', { type: () => ID }) id: string) {
    return this.subtasksService.findOne(id);
  }

  /**
   * Actualiza una subtarea existente.
   * 
   * @param {string} id - ID de la subtarea a actualizar
   * @param {UpdateSubtaskDto} input - Datos a actualizar
   * @returns {Promise<Subtask>} Subtarea actualizada
   */
  @Mutation(() => Subtask)
  updateSubtask(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSubtaskDto
  ) {
    return this.subtasksService.update(id, input);
  }

  /**
   * Elimina una subtarea del sistema.
   * 
   * @param {string} id - ID de la subtarea a eliminar
   * @returns {Promise<Subtask>} Subtarea eliminada
   */
  @Mutation(() => Subtask)
  removeSubtask(@Args('id', { type: () => ID }) id: string) {
    return this.subtasksService.remove(id);
  }

  /**
   * Obtiene catálogo completo de prioridades disponibles.
   * 
   * @returns {Promise<Priority[]>} Array de todas las prioridades
   */
  @Query(() => [Priority])
  async priorities() {
    return this.subtasksService.getAllPriorities();
  }

  /**
   * Obtiene catálogo completo de estados de subtareas disponibles.
   * 
   * @description Incluye el porcentaje de completitud de cada estado.
   * 
   * @returns {Promise<SubtaskStatus[]>} Array de estados con porcentajes
   */
  @Query(() => [SubtaskStatus])
  async subtaskStatuses() {
    return this.subtasksService.getAllSubtaskStatuses();
  }

  /**
   * Obtiene subtareas de un proceso que terminan en un mes específico.
   * 
   * @description Busca subtareas cuya fecha de término está dentro
   * del mes y año especificados, filtradas por proceso.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @param {number} processId - ID del proceso
   * @returns {Promise<Subtask[]>} Array de subtareas que terminan en el período
   */
  @Query(() => [Subtask])
  async subtasksByMonthYearAndProcess(
    @Args('monthName', { type: () => String }) monthName: string,
    @Args('year', { type: () => Int }) year: number,
    @Args('processId', { type: () => Int }) processId: number
  ) {
    return this.subtasksService.getSubtasksByMonthYearAndProcess(monthName, year, processId);
  }
} 