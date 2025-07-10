import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { ComplianceService } from './compliance.service';
import { Compliance, ComplianceStatus, CreateComplianceInput, UpdateComplianceInput } from '../graphql/graphql.types';
import { plainToInstance } from 'class-transformer';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';

/**
 * Resolver GraphQL para operaciones de cumplimiento normativo.
 * 
 * @description Proporciona la API GraphQL completa para:
 * - CRUD de registros de cumplimiento asociados a tareas
 * - Consultas especializadas por tarea y estado
 * - Gestión de estados y avance secuencial automatizado
 * - Filtros para cumplimientos activos y por estado específico
 * - Catálogo de estados de cumplimiento disponibles
 * - Operaciones públicas sin restricciones de roles
 * - Transformación automática entre tipos GraphQL y DTOs
 * 
 * @class ComplianceResolver
 * @since 1.0.0
 */
@Resolver(() => Compliance)
export class ComplianceResolver {
  constructor(private readonly complianceService: ComplianceService) {}

  // Compliance CRUD Operations
  /**
   * Crea un nuevo registro de cumplimiento para una tarea.
   * 
   * @param input - Datos del cumplimiento a crear
   * @returns Cumplimiento creado con relaciones incluidas
   */
  @Mutation(() => Compliance)
  async createCompliance(@Args('createComplianceInput') input: CreateComplianceInput) {
    const dto = plainToInstance(CreateComplianceDto, input);
    return this.complianceService.create(dto);
  }

  /**
   * Obtiene la lista completa de cumplimientos.
   * 
   * @returns Lista de todos los cumplimientos ordenados por fecha de actualización
   */
  @Query(() => [Compliance])
  async findAllCompliances() {
    return this.complianceService.findAll();
  }

  /**
   * Busca un cumplimiento específico por ID.
   * 
   * @param id - ID único del cumplimiento
   * @returns Cumplimiento encontrado o null si no existe
   */
  @Query(() => Compliance, { nullable: true })
  async findOneCompliance(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.findOne(id);
  }

  /**
   * Actualiza un cumplimiento existente con lógica de auto-avance.
   * 
   * @param id - ID del cumplimiento a actualizar
   * @param input - Nuevos datos del cumplimiento
   * @returns Cumplimiento actualizado
   */
  @Mutation(() => Compliance)
  async updateCompliance(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateComplianceInput') input: UpdateComplianceInput,
  ) {
    const dto = plainToInstance(UpdateComplianceDto, input);
    return this.complianceService.update(id, dto);
  }

  /**
   * Elimina un cumplimiento del sistema.
   * 
   * @param id - ID del cumplimiento a eliminar
   * @returns Mensaje de confirmación de eliminación
   */
  @Mutation(() => String)
  async removeCompliance(@Args('id', { type: () => ID }) id: string) {
    const result = await this.complianceService.remove(id);
    return result.message;
  }

  // Task-related queries
  /**
   * Obtiene el cumplimiento asociado a una tarea específica.
   * 
   * @param taskId - ID de la tarea
   * @returns Cumplimiento de la tarea o null si no tiene
   */
  @Query(() => Compliance, { nullable: true })
  async getTaskCompliance(@Args('taskId', { type: () => ID }) taskId: string) {
    return this.complianceService.getTaskCompliance(taskId);
  }

  // Status-related queries
  /**
   * Obtiene el catálogo completo de estados de cumplimiento.
   * 
   * @returns Lista de estados disponibles con información de días
   */
  @Query(() => [ComplianceStatus])
  async getAllComplianceStatuses() {
    return this.complianceService.getAllComplianceStatuses();
  }

  /**
   * Filtra cumplimientos por estado específico.
   * 
   * @param statusId - ID del estado de cumplimiento
   * @returns Lista de cumplimientos en el estado especificado
   */
  @Query(() => [Compliance])
  async getCompliancesByStatus(@Args('statusId', { type: () => Int }) statusId: number) {
    return this.complianceService.getCompliancesByStatus(statusId);
  }

  /**
   * Obtiene todos los cumplimientos que no están completados.
   * 
   * @returns Lista de cumplimientos activos para seguimiento
   */
  @Query(() => [Compliance])
  async getActiveCompliances() {
    return this.complianceService.getActiveCompliances();
  }

  // Process advancement
  /**
   * Avanza el cumplimiento al siguiente estado en la secuencia.
   * 
   * @param id - ID del cumplimiento a avanzar
   * @returns Cumplimiento con el nuevo estado
   */
  @Mutation(() => Compliance)
  async advanceComplianceStatus(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.advanceStatus(id);
  }
} 