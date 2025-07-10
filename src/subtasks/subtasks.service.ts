import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

/**
 * Servicio para la gestión integral de subtareas del sistema.
 * 
 * @description Servicio que maneja:
 * - CRUD completo de subtareas con estados y prioridades
 * - Transformación de datos entre formatos de BD y GraphQL
 * - Gestión de presupuestos y gastos a nivel de subtarea
 * - Control temporal: fechas de planificación y seguimiento
 * - Consultas especializadas por estado, prioridad y período
 * - Catálogos de estados y prioridades disponibles
 * - Relación directa con las tareas principales del sistema
 * 
 * @class SubtasksService
 * @injectable
 * @since 1.0.0
 */
@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mapea un DTO de subtarea al formato esperado por la base de datos.
   * 
   * @description Transforma los nombres de campos del formato GraphQL/API
   * al formato de columnas de la base de datos.
   * 
   * @param {CreateSubtaskDto | UpdateSubtaskDto} dto - DTO con datos de la subtarea
   * @returns {any} Objeto con nombres de campos de base de datos
   * 
   * @private
   * @since 1.0.0
   */
  private mapToDatabase(dto: CreateSubtaskDto | UpdateSubtaskDto) {
    return {
      nombre: dto.name,
      descripcion: dto.description,
      presupuesto: dto.budget,
      gasto: dto.expense,
      fecha_inicio: dto.startDate,
      fecha_termino: dto.endDate,
      fecha_final: dto.finalDate,
      id_estado: dto.statusId,
      id_prioridad: dto.priorityId,
      id_tarea: dto.taskId
    };
  }

  /**
   * Mapea una subtarea de base de datos al formato GraphQL/API.
   * 
   * @description Transforma los datos de la BD incluyendo relaciones
   * al formato esperado por el frontend, con nombres de campos en camelCase
   * y estructura anidada para entidades relacionadas (estado y prioridad).
   * 
   * @param {any} subtask - Subtarea de BD con relaciones incluidas
   * @returns {any} Objeto subtarea en formato GraphQL
   * 
   * @private
   * @since 1.0.0
   */
  private mapFromDatabase(subtask: any) {
    return {
      id: subtask.id_subtarea,
      taskId: subtask.id_tarea,
      name: subtask.nombre,
      description: subtask.descripcion,
      budget: subtask.presupuesto,
      expense: subtask.gasto,
      startDate: subtask.fecha_inicio,
      endDate: subtask.fecha_termino,
      finalDate: subtask.fecha_final,
      statusId: subtask.id_estado,
      priorityId: subtask.id_prioridad,
      status: subtask.subtarea_estado ? {
        id: subtask.subtarea_estado.id_subtarea_estado,
        name: subtask.subtarea_estado.estado,
        percentage: subtask.subtarea_estado.porcentaje
      } : null,
      priority: subtask.prioridad ? {
        id: subtask.prioridad.id_prioridad,
        name: subtask.prioridad.prioridad_name
      } : null
    };
  }

  /**
   * Crea una nueva subtarea en el sistema.
   * 
   * @description Proceso de creación:
   * 1. Convierte datos al formato de BD
   * 2. Crea la subtarea con relaciones incluidas
   * 3. Transforma al formato GraphQL
   * 
   * @param {CreateSubtaskDto} createSubtaskDto - Datos de la nueva subtarea
   * @returns {Promise<any>} Subtarea creada con relaciones incluidas
   * 
   * @since 1.0.0
   */
  async create(createSubtaskDto: CreateSubtaskDto) {
    const subtask = await this.prisma.subtarea.create({
      data: this.mapToDatabase(createSubtaskDto),
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });
    return this.mapFromDatabase(subtask);
  }

  /**
   * Obtiene todas las subtareas del sistema con sus relaciones.
   * 
   * @description Retorna lista completa de subtareas incluyendo estado
   * y prioridad asociados.
   * 
   * @returns {Promise<any[]>} Array de subtareas en formato GraphQL
   * 
   * @since 1.0.0
   */
  async findAll() {
    const subtasks = await this.prisma.subtarea.findMany({
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });
    return subtasks.map(subtask => this.mapFromDatabase(subtask));
  }

  /**
   * Busca una subtarea específica por su ID.
   * 
   * @param {string} id - ID único de la subtarea
   * @returns {Promise<any|null>} Subtarea encontrada o null si no existe
   * 
   * @since 1.0.0
   */
  async findOne(id: string) {
    const subtask = await this.prisma.subtarea.findUnique({
      where: { id_subtarea: id },
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });
    return subtask ? this.mapFromDatabase(subtask) : null;
  }

  /**
   * Actualiza una subtarea existente con nuevos datos.
   * 
   * @param {string} id - ID de la subtarea a actualizar
   * @param {UpdateSubtaskDto} updateSubtaskDto - Datos a actualizar
   * @returns {Promise<any>} Subtarea actualizada en formato GraphQL
   * 
   * @since 1.0.0
   */
  async update(id: string, updateSubtaskDto: UpdateSubtaskDto) {
    const subtask = await this.prisma.subtarea.update({
      where: { id_subtarea: id },
      data: this.mapToDatabase(updateSubtaskDto),
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });
    return this.mapFromDatabase(subtask);
  }

  /**
   * Elimina una subtarea del sistema.
   * 
   * @param {string} id - ID de la subtarea a eliminar
   * @returns {Promise<any>} Subtarea eliminada en formato GraphQL
   * 
   * @since 1.0.0
   */
  async remove(id: string) {
    const subtask = await this.prisma.subtarea.delete({
      where: { id_subtarea: id },
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });
    return this.mapFromDatabase(subtask);
  }

  /**
   * Obtiene el catálogo completo de prioridades disponibles.
   * 
   * @returns {Promise<any[]>} Array de prioridades con id y nombre
   * 
   * @since 1.0.0
   */
  async getAllPriorities() {
    const priorities = await this.prisma.prioridad.findMany({
      select: {
        id_prioridad: true,
        prioridad_name: true
      }
    });

    return priorities.map(priority => ({
      id: priority.id_prioridad,
      name: priority.prioridad_name
    }));
  }

  /**
   * Obtiene el catálogo completo de estados de subtareas disponibles.
   * 
   * @description Incluye el porcentaje de completitud asociado a cada estado.
   * 
   * @returns {Promise<any[]>} Array de estados con id, nombre y porcentaje
   * 
   * @since 1.0.0
   */
  async getAllSubtaskStatuses() {
    const statuses = await this.prisma.subtarea_estado.findMany({
      select: {
        id_subtarea_estado: true,
        estado: true,
        porcentaje: true
      }
    });

    return statuses.map(status => ({
      id: status.id_subtarea_estado,
      name: status.estado,
      percentage: status.porcentaje
    }));
  }

  /**
   * Mapeo de nombres de meses en español a números (base 1).
   * @private
   */
  private readonly MONTH_MAPPING = {
    'enero': 1,
    'febrero': 2,
    'marzo': 3,
    'abril': 4,
    'mayo': 5,
    'junio': 6,
    'julio': 7,
    'agosto': 8,
    'septiembre': 9,
    'octubre': 10,
    'noviembre': 11,
    'diciembre': 12
  };

  /**
   * Convierte el nombre de un mes en español a su número correspondiente.
   * 
   * @param {string} monthName - Nombre del mes en español (ej: 'enero', 'febrero')
   * @returns {number} Número del mes (1-12, donde 1 = enero)
   * 
   * @throws {Error} Si el nombre del mes no es válido
   * 
   * @private
   * @since 1.0.0
   */
  private getMonthNumber(monthName: string): number {
    const normalizedMonth = monthName.toLowerCase();
    const monthNumber = this.MONTH_MAPPING[normalizedMonth];
    
    if (!monthNumber) {
      throw new Error(`Invalid month name: ${monthName}`);
    }
    
    return monthNumber;
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
   * @returns {Promise<any[]>} Array de subtareas que terminan en el período
   * 
   * @since 1.0.0
   */
  async getSubtasksByMonthYearAndProcess(monthName: string, year: number, processId: number) {
    const monthId = this.getMonthNumber(monthName);
    
    const processTasks = await this.prisma.tarea.findMany({
      where: { proceso: processId },
      select: { id_tarea: true }
    });

    if (processTasks.length === 0) {
      return [];
    }

    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        id_tarea: {
          in: processTasks.map(task => task.id_tarea)
        },
        fecha_termino: {
          not: null,
          gte: new Date(year, monthId - 1, 1),
          lte: new Date(year, monthId - 1, new Date(year, monthId, 0).getDate())
        }
      },
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });

    return subtasks.map(subtask => this.mapFromDatabase(subtask));
  }

  /**
   * Obtiene todas las subtareas que tienen un estado específico.
   * 
   * @param {number} statusId - ID del estado a filtrar
   * @returns {Promise<any[]>} Array de subtareas con el estado especificado
   * 
   * @since 1.0.0
   */
  async getSubtasksByStatus(statusId: number) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: { id_estado: statusId },
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });
    return subtasks.map(subtask => this.mapFromDatabase(subtask));
  }

  /**
   * Obtiene todas las subtareas que tienen una prioridad específica.
   * 
   * @param {number} priorityId - ID de la prioridad a filtrar
   * @returns {Promise<any[]>} Array de subtareas con la prioridad especificada
   * 
   * @since 1.0.0
   */
  async getSubtasksByPriority(priorityId: number) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: { id_prioridad: priorityId },
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });
    return subtasks.map(subtask => this.mapFromDatabase(subtask));
  }
} 