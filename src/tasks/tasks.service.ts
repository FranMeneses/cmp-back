import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SubtasksService } from '../subtasks/subtasks.service';
import { ComplianceService } from '../compliance/compliance.service';

/**
 * Servicio principal para la gestión integral de tareas del sistema.
 * 
 * @description Servicio central que maneja:
 * - CRUD completo de tareas con validación de duplicados
 * - Transformación de datos entre formatos de BD y GraphQL
 * - Análisis de progreso y estados de tareas
 * - Cálculos financieros: presupuestos y gastos
 * - Consultas complejas por múltiples criterios (valle, proceso, mes, etc.)
 * - Integración con subtareas y sistema de compliance
 * - Generación de reportes y estadísticas de gestión
 * - Gestión de historial y auditoría de cambios
 * 
 * @class TasksService
 * @injectable
 * @since 1.0.0
 */
@Injectable()
export class TasksService {
  private readonly COMPLETED_STATUS_ID = 5;

  constructor(
    private prisma: PrismaService,
    private subtasksService: SubtasksService,
    private complianceService: ComplianceService
  ) {}

  /**
   * Mapea un DTO de tarea al formato esperado por la base de datos.
   * 
   * @description Transforma los nombres de campos del formato GraphQL/API
   * al formato de columnas de la base de datos.
   * 
   * @param {CreateTaskDto | UpdateTaskDto} taskDto - DTO con datos de la tarea
   * @returns {any} Objeto con nombres de campos de base de datos
   * 
   * @private
   * @since 1.0.0
   */
  private mapToDatabase(taskDto: CreateTaskDto | UpdateTaskDto) {
    const data: any = {};
    
    if (taskDto.name !== undefined) data.nombre = taskDto.name;
    if (taskDto.description !== undefined) data.descripcion = taskDto.description;
    if (taskDto.valleyId !== undefined) data.id_valle = taskDto.valleyId;
    if (taskDto.faenaId !== undefined) data.id_faena = taskDto.faenaId;
    if (taskDto.processId !== undefined) data.proceso = taskDto.processId;
    if (taskDto.statusId !== undefined) data.estado = taskDto.statusId;
    if (taskDto.applies !== undefined) data.aplica = taskDto.applies;
    if (taskDto.beneficiaryId !== undefined) data.beneficiario = taskDto.beneficiaryId;
    
    return data;
  }

  /**
   * Mapea una tarea de base de datos al formato GraphQL/API.
   * 
   * @description Transforma los datos de la BD incluyendo relaciones
   * al formato esperado por el frontend, con nombres de campos en camelCase
   * y estructura anidada para entidades relacionadas.
   * 
   * @param {any} task - Tarea de BD con relaciones incluidas
   * @returns {any} Objeto tarea en formato GraphQL
   * 
   * @private
   * @since 1.0.0
   */
  private mapFromDatabase(task: any) {
    return {
      id: task.id_tarea,
      name: task.nombre,
      description: task.descripcion,
      valleyId: task.id_valle,
      faenaId: task.id_faena,
      processId: task.proceso,
      statusId: task.estado,
      applies: task.aplica,
      beneficiaryId: task.beneficiario,
      valley: task.valle ? {
        id: task.valle.id_valle,
        name: task.valle.valle_name
      } : null,
      faena: task.faena ? {
        id: task.faena.id_faena,
        name: task.faena.faena_name
      } : null,
      process: task.proceso_rel ? {
        id: task.proceso_rel.id_proceso,
        name: task.proceso_rel.proceso_name
      } : null,
      status: task.tarea_estado ? {
        id: task.tarea_estado.id_tarea_estado,
        name: task.tarea_estado.estado
      } : null,
      beneficiary: task.beneficiario_rel ? {
        id: task.beneficiario_rel.id_beneficiario,
        legalName: task.beneficiario_rel.nombre_legal,
        rut: task.beneficiario_rel.rut,
        address: task.beneficiario_rel.direccion,
        entityType: task.beneficiario_rel.tipo_entidad,
        representative: task.beneficiario_rel.representante,
        hasLegalPersonality: task.beneficiario_rel.personalidad_juridica
      } : null
    };
  }

  /**
   * Mapeo de nombres de meses en español a números (base 0).
   * @private
   */
  private readonly MONTH_MAPPING = {
    'enero': 0,
    'febrero': 1,
    'marzo': 2,
    'abril': 3,
    'mayo': 4,
    'junio': 5,
    'julio': 6,
    'agosto': 7,
    'septiembre': 8,
    'octubre': 9,
    'noviembre': 10,
    'diciembre': 11
  };

  /**
   * Convierte el nombre de un mes en español a su número correspondiente.
   * 
   * @param {string} monthName - Nombre del mes en español (ej: 'enero', 'febrero')
   * @returns {number} Número del mes (0-11, donde 0 = enero)
   * 
   * @throws {Error} Si el nombre del mes no es válido
   * 
   * @private
   * @since 1.0.0
   */
  private getMonthNumber(monthName: string): number {
    const normalizedMonth = monthName.toLowerCase();
    const monthNumber = this.MONTH_MAPPING[normalizedMonth];
    
    if (monthNumber === undefined) {
      throw new Error(`Invalid month name: ${monthName}`);
    }
    
    return monthNumber;
  }

  /**
   * Crea una nueva tarea en el sistema con validación de duplicados.
   * 
   * @description Proceso de creación:
   * 1. Valida que no exista una tarea duplicada
   * 2. Crea la tarea en base de datos
   * 3. Incluye todas las relaciones necesarias
   * 4. Transforma al formato GraphQL
   * 
   * @param {CreateTaskDto} createTaskDto - Datos de la nueva tarea
   * @returns {Promise<any>} Tarea creada con relaciones incluidas
   * 
   * @throws {BadRequestException} Si la tarea está duplicada o hay datos inválidos
   * 
   * @since 1.0.0
   */
  async create(createTaskDto: CreateTaskDto) {
    // Verificar que no exista una tarea duplicada
    await this.validateTaskDuplication(createTaskDto);

    const task = await this.prisma.tarea.create({
      data: this.mapToDatabase(createTaskDto),
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true
      }
    });
    return this.mapFromDatabase(task);
  }

  /**
   * Valida que no exista una tarea duplicada con los mismos criterios.
   * 
   * @description Verifica duplicación basada en: nombre, proceso, valle y beneficiario.
   * Una tarea se considera duplicada si tiene el mismo nombre y proceso,
   * en el mismo valle (si aplica) y para el mismo beneficiario (si aplica).
   * 
   * @param {CreateTaskDto} taskDto - Datos de la tarea a validar
   * 
   * @throws {BadRequestException} Si faltan datos obligatorios o existe duplicado
   * 
   * @private
   * @since 1.0.0
   */
  private async validateTaskDuplication(taskDto: CreateTaskDto) {
    if (!taskDto.name || !taskDto.processId) {
      throw new BadRequestException('El nombre y proceso son obligatorios para validar duplicados');
    }

    const existingTask = await this.prisma.tarea.findFirst({
      where: {
        nombre: taskDto.name,
        proceso: taskDto.processId,
        id_valle: taskDto.valleyId || null,
        beneficiario: taskDto.beneficiaryId || null
      }
    });

    if (existingTask) {
      const valleyInfo = taskDto.valleyId ? ` en el valle ${taskDto.valleyId}` : '';
      const beneficiaryInfo = taskDto.beneficiaryId ? ` para el beneficiario ${taskDto.beneficiaryId}` : '';
      
      throw new BadRequestException(
        `Ya existe una tarea con el nombre "${taskDto.name}" en el proceso ${taskDto.processId}${valleyInfo}${beneficiaryInfo}`
      );
    }
  }

  /**
   * Obtiene todas las tareas del sistema con sus relaciones.
   * 
   * @description Retorna lista completa de tareas incluyendo estado, valle,
   * faena, proceso y beneficiario asociados.
   * 
   * @returns {Promise<any[]>} Array de tareas en formato GraphQL
   * 
   * @since 1.0.0
   */
  async findAll() {
    const tasks = await this.prisma.tarea.findMany({
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true
      }
    });
    return tasks.map(task => this.mapFromDatabase(task));
  }

  /**
   * Busca una tarea específica por su ID.
   * 
   * @param {string} id - ID único de la tarea
   * @returns {Promise<any|null>} Tarea encontrada o null si no existe
   * 
   * @since 1.0.0
   */
  async findOne(id: string) {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: id },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true
      }
    });
    return task ? this.mapFromDatabase(task) : null;
  }

  /**
   * Actualiza una tarea existente con nuevos datos.
   * 
   * @param {string} id - ID de la tarea a actualizar
   * @param {UpdateTaskDto} updateTaskDto - Datos a actualizar
   * @returns {Promise<any>} Tarea actualizada en formato GraphQL
   * 
   * @since 1.0.0
   */
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.tarea.update({
      where: { id_tarea: id },
      data: this.mapToDatabase(updateTaskDto),
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true
      }
    });

    return this.mapFromDatabase(task);
  }

  /**
   * Crea un registro de historial a partir de una tarea completada.
   * 
   * @description Genera un snapshot completo de la tarea incluyendo:
   * - Datos básicos de la tarea
   * - Gastos totales calculados
   * - Códigos SAP del compliance
   * - Documentos asociados copiados al historial
   * 
   * @param {string} taskId - ID de la tarea a historificar
   * @returns {Promise<any>} Registro de historial creado
   * 
   * @throws {Error} Si la tarea no existe
   * 
   * @private
   * @since 1.0.0
   */
  private async createHistoryFromTask(taskId: string): Promise<any> {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: taskId },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true,
        cumplimiento: {
          include: {
            cumplimiento_estado: true
          }
        },
        documento: true
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Get total expense from subtasks
    const totalExpense = await this.getTotalExpense(taskId);
    
    let solpedMemoSap = 0;
    let hesHemSap = 0;

    // Get SAP codes from the compliance process
    const cumplimiento = task.cumplimiento[0];
    if (cumplimiento) {
      solpedMemoSap = cumplimiento.SOLPED_MEMO_SAP || 0;
      hesHemSap = cumplimiento.HES_HEM_SAP || 0;
    }

    // Create history record with its documents
    const history = await this.prisma.historial.create({
      data: {
        nombre: task.nombre,
        id_proceso: task.proceso,
        fecha_final: new Date(),
        gasto_total: totalExpense,
        id_valle: task.id_valle,
        id_faena: task.id_faena,
        beneficiario: task.beneficiario,
        SOLPED_MEMO_SAP: solpedMemoSap,
        HES_HEM_SAP: hesHemSap,
        historial_doc: {
          create: task.documento.map(doc => ({
            nombre_archivo: doc.nombre_archivo,
            tipo_documento: doc.tipo_documento,
            ruta: doc.ruta,
            fecha_carga: doc.fecha_carga
          }))
        }
      },
      include: {
        historial_doc: true,
        beneficiario_rel: true
      }
    });

    return history;
  }

  /**
   * Elimina una tarea completa del sistema incluyendo todas sus dependencias.
   * 
   * @description Proceso de eliminación en transacción:
   * 1. Elimina documentos asociados
   * 2. Elimina registros de compliance (con cascada a solpeds y memos)
   * 3. Elimina subtareas
   * 4. Elimina la tarea principal
   * 
   * @param {string} id - ID de la tarea a eliminar
   * @returns {Promise<any>} Tarea eliminada en formato GraphQL
   * 
   * @throws {Error} Si la tarea no existe
   * 
   * @since 1.0.0
   */
  async remove(id: string) {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: id },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true,
        subtarea: true,
        cumplimiento: true,
        documento: true
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    await this.prisma.$transaction(async (prisma) => {
      // 1. Eliminar documentos
      if (task.documento.length > 0) {
        await prisma.documento.deleteMany({
          where: { id_tarea: id }
        });
      }

      // 2. Eliminar cumplimientos (esto eliminará en cascada los registros, solpeds y memos)
      for (const cumplimiento of task.cumplimiento) {
        await this.complianceService.remove(cumplimiento.id_cumplimiento);
      }

      // 3. Eliminar subtareas
      if (task.subtarea.length > 0) {
        await prisma.subtarea.deleteMany({
          where: { id_tarea: id }
        });
      }

      // 4. Finalmente, eliminar la tarea
      await prisma.tarea.delete({
        where: { id_tarea: id }
      });
    });

    return this.mapFromDatabase(task);
  }

  /**
   * Obtiene todas las subtareas asociadas a una tarea específica.
   * 
   * @param {string} id - ID de la tarea padre
   * @returns {Promise<any[]>} Array de subtareas con información completa
   * 
   * @since 1.0.0
   */
  async getTaskSubtasks(id: string) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: { id_tarea: id }
    });
    
    return Promise.all(subtasks.map(subtask => 
      this.subtasksService.findOne(subtask.id_subtarea)
    ));
  }

  /**
   * Calcula el progreso promedio de una tarea basado en sus subtareas.
   * 
   * @description El progreso se calcula como el promedio de los porcentajes
   * de todas las subtareas asociadas. Si no hay subtareas, retorna 0.
   * 
   * @param {string} id - ID de la tarea
   * @returns {Promise<number>} Porcentaje de progreso (0-100)
   * 
   * @since 1.0.0
   */
  async getTaskProgress(id: string) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: { id_tarea: id },
      include: {
        subtarea_estado: true
      }
    });

    if (subtasks.length === 0) {
      return 0;
    }

    const totalProgress = subtasks.reduce((sum, subtask) => {
      return sum + (subtask.subtarea_estado?.porcentaje || 0);
    }, 0);

    return totalProgress / subtasks.length;
  }

  /**
   * Calcula el presupuesto total de una tarea sumando presupuestos de subtareas.
   * 
   * @param {string} id - ID de la tarea
   * @returns {Promise<number>} Presupuesto total en CLP
   * 
   * @since 1.0.0
   */
  async getTotalBudget(id: string) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: { id_tarea: id }
    });

    if (subtasks.length === 0) {
      return 0;
    }

    return subtasks.reduce((total, subtask) => {
      return total + (subtask.presupuesto || 0);
    }, 0);
  }

  /**
   * Calcula el gasto total real de una tarea sumando gastos de subtareas.
   * 
   * @param {string} id - ID de la tarea
   * @returns {Promise<number>} Gasto total en CLP
   * 
   * @since 1.0.0
   */
  async getTotalExpense(id: string) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: { id_tarea: id }
    });

    if (subtasks.length === 0) {
      return 0;
    }

    return subtasks.reduce((total, subtask) => {
      return total + (subtask.gasto || 0);
    }, 0);
  }

  /**
   * Cuenta el número total de tareas asignadas a un valle específico.
   * 
   * @param {number} valleyId - ID del valle
   * @returns {Promise<number>} Cantidad de tareas del valle
   * 
   * @since 1.0.0
   */
  async getValleyTasksCount(valleyId: number) {
    return this.prisma.tarea.count({
      where: { id_valle: valleyId }
    });
  }

  /**
   * Obtiene todas las subtareas de todas las tareas de un valle específico.
   * 
   * @param {number} valleyId - ID del valle
   * @returns {Promise<any[]>} Array de subtareas del valle
   * 
   * @since 1.0.0
   */
  async getValleySubtasks(valleyId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: { id_valle: valleyId },
      select: { id_tarea: true }
    });

    if (tasks.length === 0) {
      return [];
    }

    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        id_tarea: {
          in: tasks.map(task => task.id_tarea)
        }
      }
    });

    return Promise.all(subtasks.map(subtask => 
      this.subtasksService.findOne(subtask.id_subtarea)
    ));
  }

  /**
   * Calcula el presupuesto total de todas las subtareas que inician en un mes específico.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @returns {Promise<number>} Presupuesto total del mes
   * 
   * @since 1.0.0
   */
  async getTotalBudgetByMonth(monthName: string, year: number) {
    const monthId = this.getMonthNumber(monthName);
    
    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        fecha_inicio: {
          not: null,
          gte: new Date(year, monthId - 1, 1),
          lt: new Date(year, monthId, 1)
        }
      }
    });

    const mappedSubtasks = await Promise.all(
      subtasks.map(subtask => this.subtasksService.findOne(subtask.id_subtarea))
    );

    return mappedSubtasks.reduce((total, subtask) => {
      return total + (subtask?.budget || 0);
    }, 0);
  }

  /**
   * Calcula el gasto total de todas las subtareas que inician en un mes específico.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @returns {Promise<number>} Gasto total del mes
   * 
   * @since 1.0.0
   */
  async getTotalExpenseByMonth(monthName: string, year: number) {
    const monthId = this.getMonthNumber(monthName);
    
    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        fecha_inicio: {
          not: null,
          gte: new Date(year, monthId - 1, 1),
          lt: new Date(year, monthId, 1)
        }
      }
    });

    const mappedSubtasks = await Promise.all(
      subtasks.map(subtask => this.subtasksService.findOne(subtask.id_subtarea))
    );

    return mappedSubtasks.reduce((total, subtask) => {
      return total + (subtask?.expense || 0);
    }, 0);
  }

  /**
   * Calcula gastos totales por mes filtrado por proceso específico.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @param {number} processId - ID del proceso a filtrar
   * @returns {Promise<number>} Gasto total del mes y proceso
   * 
   * @since 1.0.0
   */
  async getTotalExpenseByMonthAndProcess(monthName: string, year: number, processId: number) {
    const monthId = this.getMonthNumber(monthName);
    
    const tasks = await this.prisma.tarea.findMany({
      where: { proceso: processId },
      select: { id_tarea: true }
    });

    if (tasks.length === 0) {
      return 0;
    }

    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        id_tarea: {
          in: tasks.map(task => task.id_tarea)
        },
        fecha_inicio: {
          not: null,
          gte: new Date(year, monthId - 1, 1),
          lt: new Date(year, monthId, 1)
        }
      }
    });

    const mappedSubtasks = await Promise.all(
      subtasks.map(subtask => this.subtasksService.findOne(subtask.id_subtarea))
    );

    return mappedSubtasks.reduce((total, subtask) => {
      return total + (subtask?.expense || 0);
    }, 0);
  }

  /**
   * Calcula presupuesto total por mes filtrado por proceso específico.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @param {number} processId - ID del proceso a filtrar
   * @returns {Promise<number>} Presupuesto total del mes y proceso
   * 
   * @since 1.0.0
   */
  async getTotalBudgetByMonthAndProcess(monthName: string, year: number, processId: number) {
    const monthId = this.getMonthNumber(monthName);
    
    const tasks = await this.prisma.tarea.findMany({
      where: { proceso: processId },
      select: { id_tarea: true }
    });

    if (tasks.length === 0) {
      return 0;
    }

    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        id_tarea: {
          in: tasks.map(task => task.id_tarea)
        },
        fecha_inicio: {
          not: null,
          gte: new Date(year, monthId - 1, 1),
          lt: new Date(year, monthId, 1)
        }
      }
    });

    const mappedSubtasks = await Promise.all(
      subtasks.map(subtask => this.subtasksService.findOne(subtask.id_subtarea))
    );

    return mappedSubtasks.reduce((total, subtask) => {
      return total + (subtask?.budget || 0);
    }, 0);
  }

  /**
   * Obtiene todas las tareas asignadas a un valle específico.
   * 
   * @param {number} valleyId - ID del valle
   * @returns {Promise<any[]>} Array de tareas del valle con relaciones
   * 
   * @since 1.0.0
   */
  async getTasksByValley(valleyId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: { id_valle: valleyId },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        beneficiario_rel: true
      }
    });

    return tasks.map(task => this.mapFromDatabase(task));
  }

  /**
   * Cuenta tareas de un valle que están asociadas a una inversión específica.
   * 
   * @param {number} valleyId - ID del valle
   * @param {number} investmentId - ID de la inversión
   * @returns {Promise<number>} Cantidad de tareas que coinciden
   * 
   * @since 1.0.0
   */
  async getValleyInvestmentTasksCount(valleyId: number, investmentId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: { id_valle: valleyId },
      select: { id_tarea: true }
    });

    if (tasks.length === 0) {
      return 0;
    }

    return this.prisma.info_tarea.count({
      where: {
        id_tarea: {
          in: tasks.map(task => task.id_tarea)
        },
        id_inversion: investmentId
      }
    });
  }

  /**
   * Obtiene el catálogo completo de valles disponibles en el sistema.
   * 
   * @returns {Promise<any[]>} Array de valles con id y nombre
   * 
   * @since 1.0.0
   */
  async getAllValleys() {
    const valleys = await this.prisma.valle.findMany({
      select: {
        id_valle: true,
        valle_name: true
      }
    });

    return valleys.map(valley => ({
      id: valley.id_valle,
      name: valley.valle_name
    }));
  }

  /**
   * Obtiene el catálogo completo de faenas disponibles en el sistema.
   * 
   * @returns {Promise<any[]>} Array de faenas con id y nombre
   * 
   * @since 1.0.0
   */
  async getAllFaenas() {
    const faenas = await this.prisma.faena.findMany({
      select: {
        id_faena: true,
        faena_name: true
      }
    });

    return faenas.map(faena => ({
      id: faena.id_faena,
      name: faena.faena_name
    }));
  }

  /**
   * Genera reporte de presupuestos mensuales para un proceso específico.
   * 
   * @description Calcula el presupuesto total por cada mes del año,
   * basado en las fechas de inicio de las subtareas del proceso.
   * 
   * @param {number} processId - ID del proceso
   * @param {number} year - Año de consulta
   * @returns {Promise<any[]>} Array con presupuesto por mes
   * 
   * @since 1.0.0
   */
  async getProcessMonthlyBudgets(processId: number, year: number) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const monthlyBudgets = await Promise.all(
      months.map(async (month) => {
        const monthId = this.getMonthNumber(month);
        const startDate = new Date(Date.UTC(year, monthId, 1));
        const endDate = new Date(Date.UTC(year, monthId + 1, 1)); // Primer día del mes siguiente

        const tasks = await this.prisma.tarea.findMany({
          where: { proceso: processId },
          select: { id_tarea: true }
        });

        if (tasks.length === 0) {
          return {
            month,
            budget: 0
          };
        }

        const subtasks = await this.prisma.subtarea.findMany({
          where: {
            id_tarea: {
              in: tasks.map(task => task.id_tarea)
            },
            fecha_inicio: {
              gte: startDate,
              lt: endDate
            }
          }
        });

        const totalBudget = subtasks.reduce((total, subtask) => {
          return total + (subtask.presupuesto || 0);
        }, 0);

        return {
          month,
          budget: totalBudget
        };
      })
    );

    return monthlyBudgets;
  }

  /**
   * Genera reporte de gastos mensuales para un proceso específico.
   * 
   * @description Calcula el gasto total por cada mes del año,
   * basado en las fechas de inicio de las subtareas del proceso.
   * 
   * @param {number} processId - ID del proceso
   * @param {number} year - Año de consulta
   * @returns {Promise<any[]>} Array con gastos por mes
   * 
   * @since 1.0.0
   */
  async getProcessMonthlyExpenses(processId: number, year: number) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const monthlyExpenses = await Promise.all(
      months.map(async (month) => {
        const monthId = this.getMonthNumber(month);
        const startDate = new Date(Date.UTC(year, monthId, 1));
        const endDate = new Date(Date.UTC(year, monthId + 1, 1));

        const tasks = await this.prisma.tarea.findMany({
          where: { proceso: processId },
          select: { id_tarea: true }
        });

        if (tasks.length === 0) {
          return {
            month,
            expense: 0
          };
        }

        const subtasks = await this.prisma.subtarea.findMany({
          where: {
            id_tarea: {
              in: tasks.map(task => task.id_tarea)
            },
            fecha_inicio: {
              gte: startDate,
              lt: endDate
            }
          }
        });


        const totalExpense = subtasks.reduce((total, subtask) => {
          return total + (subtask.gasto || 0);
        }, 0);

        return {
          month,
          expense: totalExpense
        };
      })
    );

    return monthlyExpenses;
  }

  /**
   * Obtiene el catálogo completo de estados de tareas disponibles.
   * 
   * @returns {Promise<any[]>} Array de estados con id y nombre
   * 
   * @since 1.0.0
   */
  async getAllTaskStatuses() {
    const statuses = await this.prisma.tarea_estado.findMany({
      select: {
        id_tarea_estado: true,
        estado: true
      }
    });

    return statuses.map(status => ({
      id: status.id_tarea_estado,
      name: status.estado
    }));
  }

  /**
   * Obtiene tareas filtradas por valle y estado específicos.
   * 
   * @param {number} valleyId - ID del valle
   * @param {number} statusId - ID del estado
   * @returns {Promise<any[]>} Array de tareas que coinciden con los filtros
   * 
   * @since 1.0.0
   */
  async getTasksByValleyAndStatus(valleyId: number, statusId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: {
        id_valle: valleyId,
        estado: statusId
      },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        beneficiario_rel: true
      }
    });

    return tasks.map(task => this.mapFromDatabase(task));
  }

  /**
   * Obtiene el catálogo completo de procesos empresariales disponibles.
   * 
   * @returns {Promise<any[]>} Array de procesos con id y nombre
   * 
   * @since 1.0.0
   */
  async getAllProcesses() {
    const processes = await this.prisma.proceso.findMany();
    return processes.map(process => ({
      id: process.id_proceso,
      name: process.proceso_name
    }));
  }

  /**
   * Obtiene todas las tareas asociadas a un proceso específico.
   * 
   * @param {number} processId - ID del proceso
   * @returns {Promise<any[]>} Array de tareas del proceso con relaciones
   * 
   * @since 1.0.0
   */
  async getTasksByProcess(processId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: { 
        proceso: processId
      },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true
      }
    });
    return tasks.map(task => this.mapFromDatabase(task));
  }

  /**
   * Obtiene tareas filtradas por proceso y valle específicos.
   * 
   * @param {number} processId - ID del proceso
   * @param {number} valleyId - ID del valle
   * @returns {Promise<any[]>} Array de tareas que coinciden con ambos filtros
   * 
   * @since 1.0.0
   */
  async getTasksByProcessAndValley(processId: number, valleyId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: {
        proceso: processId,
        id_valle: valleyId
      },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        beneficiario_rel: true
      }
    });

    return tasks.map(task => this.mapFromDatabase(task));
  }

  /**
   * Obtiene tareas filtradas por proceso y estado específicos.
   * 
   * @param {number} processId - ID del proceso
   * @param {number} statusId - ID del estado
   * @returns {Promise<any[]>} Array de tareas que coinciden con ambos filtros
   * 
   * @since 1.0.0
   */
  async getTasksByProcessAndStatus(processId: number, statusId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: {
        proceso: processId,
        estado: statusId
      },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        beneficiario_rel: true
      }
    });

    return tasks.map(task => this.mapFromDatabase(task));
  }

  /**
   * Obtiene todas las subtareas de tareas asociadas a un proceso específico.
   * 
   * @description Busca todas las tareas del proceso y luego obtiene
   * todas las subtareas asociadas a esas tareas.
   * 
   * @param {number} processId - ID del proceso
   * @returns {Promise<any[]>} Array de subtareas del proceso
   * 
   * @since 1.0.0
   */
  async getSubtasksByProcess(processId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: { 
        proceso: processId
      },
      select: { id_tarea: true }
    });

    if (tasks.length === 0) {
      return [];
    }

    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        id_tarea: {
          in: tasks.map(task => task.id_tarea)
        }
      }
    });

    return Promise.all(subtasks.map(subtask => 
      this.subtasksService.findOne(subtask.id_subtarea)
    ));
  }

  /**
   * Obtiene tareas que tienen subtareas iniciadas en un mes específico.
   * 
   * @description Busca tareas cuyas subtareas tienen fecha de inicio
   * dentro del mes especificado. Una tarea aparece si al menos una
   * de sus subtareas inició en el mes consultado.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @returns {Promise<any[]>} Array de tareas con actividad en el mes
   * 
   * @since 1.0.0
   */
  async getTasksByMonth(monthName: string, year: number) {
    const monthId = this.getMonthNumber(monthName);
    const startDate = new Date(Date.UTC(year, monthId, 1));
    const endDate = new Date(Date.UTC(year, monthId + 1, 1));
    
    // Obtener subtareas del mes especificado
    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        fecha_inicio: {
          not: null,
          gte: startDate,
          lt: endDate
        }
      },
      select: { id_tarea: true }
    });

    if (subtasks.length === 0) {
      return [];
    }

    // Obtener las tareas únicas asociadas a estas subtareas
    const uniqueTaskIds = [...new Set(subtasks.map(subtask => subtask.id_tarea))];
    
    const tasks = await this.prisma.tarea.findMany({
      where: {
        id_tarea: {
          in: uniqueTaskIds
        }
      },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true
      }
    });

    return tasks.map(task => this.mapFromDatabase(task));
  }

  /**
   * Obtiene tareas de un proceso que tienen subtareas iniciadas en un mes específico.
   * 
   * @description Combina filtros de proceso y temporal: busca tareas del proceso
   * especificado que tienen al menos una subtarea iniciada en el mes consultado.
   * 
   * @param {string} monthName - Nombre del mes en español
   * @param {number} year - Año de consulta
   * @param {number} processId - ID del proceso
   * @returns {Promise<any[]>} Array de tareas del proceso con actividad en el mes
   * 
   * @since 1.0.0
   */
  async getTasksByMonthAndProcess(monthName: string, year: number, processId: number) {
    const monthId = this.getMonthNumber(monthName);
    const startDate = new Date(Date.UTC(year, monthId, 1));
    const endDate = new Date(Date.UTC(year, monthId + 1, 1));
    
    // Primero obtener las tareas del proceso especificado
    const processTasks = await this.prisma.tarea.findMany({
      where: { proceso: processId },
      select: { id_tarea: true }
    });

    if (processTasks.length === 0) {
      return [];
    }

    // Luego filtrar por subtareas que tienen fecha de inicio en el mes especificado
    const subtasks = await this.prisma.subtarea.findMany({
      where: {
        id_tarea: {
          in: processTasks.map(task => task.id_tarea)
        },
        fecha_inicio: {
          not: null,
          gte: startDate,
          lt: endDate
        }
      },
      select: { id_tarea: true }
    });

    if (subtasks.length === 0) {
      return [];
    }

    // Obtener las tareas únicas asociadas a estas subtareas
    const uniqueTaskIds = [...new Set(subtasks.map(subtask => subtask.id_tarea))];
    
    const tasks = await this.prisma.tarea.findMany({
      where: {
        id_tarea: {
          in: uniqueTaskIds
        }
      },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true
      }
    });

    return tasks.map(task => this.mapFromDatabase(task));
  }

  /**
   * Obtiene tareas de un proceso que tienen registros de compliance asociados.
   * 
   * @description Filtra las tareas del proceso que tienen al menos un
   * registro de cumplimiento/compliance creado, útil para reportes
   * de seguimiento regulatorio.
   * 
   * @param {number} processId - ID del proceso
   * @returns {Promise<any[]>} Array de tareas del proceso con compliance
   * 
   * @since 1.0.0
   */
  async getTasksByProcessWithCompliance(processId: number) {
    const tasks = await this.prisma.tarea.findMany({
      where: { 
        proceso: processId
      },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true,
        beneficiario_rel: true,
        cumplimiento: true
      }
    });

    return tasks
      .filter(task => Array.isArray(task.cumplimiento) && task.cumplimiento.length > 0)
      .map(task => this.mapFromDatabase(task));
  }
} 