import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SubtasksService } from '../subtasks/subtasks.service';
import { ComplianceService } from '../compliance/compliance.service';

@Injectable()
export class TasksService {
  private readonly COMPLETED_STATUS_ID = 5;

  constructor(
    private prisma: PrismaService,
    private subtasksService: SubtasksService,
    private complianceService: ComplianceService
  ) {}

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

  private getMonthNumber(monthName: string): number {
    const normalizedMonth = monthName.toLowerCase();
    const monthNumber = this.MONTH_MAPPING[normalizedMonth];
    
    if (!monthNumber) {
      throw new Error(`Invalid month name: ${monthName}`);
    }
    
    return monthNumber;
  }

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

    // Si la tarea cambió a estado "Completada", crear registro histórico
    if (updateTaskDto.statusId === this.COMPLETED_STATUS_ID) {
      await this.createHistoryFromTask(id);
    }

    return this.mapFromDatabase(task);
  }

  private async createHistoryFromTask(taskId: string): Promise<any> {
    // Get the task with all its related data
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

  async getTaskSubtasks(id: string) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: { id_tarea: id }
    });
    
    return Promise.all(subtasks.map(subtask => 
      this.subtasksService.findOne(subtask.id_subtarea)
    ));
  }

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

  async getValleyTasksCount(valleyId: number) {
    return this.prisma.tarea.count({
      where: { id_valle: valleyId }
    });
  }

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

  async getProcessMonthlyBudgets(processId: number, year: number) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const monthlyBudgets = await Promise.all(
      months.map(async (month) => {
        const monthId = this.getMonthNumber(month);
        const startDate = new Date(year, monthId - 1, 1);
        const endDate = new Date(year, monthId, 0);

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
              not: null,
              gte: startDate,
              lte: endDate
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

  async getProcessMonthlyExpenses(processId: number, year: number) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const monthlyExpenses = await Promise.all(
      months.map(async (month) => {
        const monthId = this.getMonthNumber(month);
        const startDate = new Date(year, monthId - 1, 1);
        const endDate = new Date(year, monthId, 0);

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
              not: null,
              gte: startDate,
              lte: endDate
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

  async getAllProcesses() {
    const processes = await this.prisma.proceso.findMany();
    return processes.map(process => ({
      id: process.id_proceso,
      name: process.proceso_name
    }));
  }

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