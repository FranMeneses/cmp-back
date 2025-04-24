import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(taskDto: CreateTaskDto | UpdateTaskDto) {
    return {
      nombre: taskDto.nombre,
      descripcion: taskDto.descripcion,
      id_valle: taskDto.id_valle,
      id_faena: taskDto.id_faena,
      id_estado: taskDto.id_estado
    };
  }

  private mapFromDatabase(task: any) {
    return {
      id: task.id_tarea,
      name: task.nombre,
      description: task.descripcion,
      valleyId: task.id_valle,
      faenaId: task.id_faena,
      statusId: task.id_estado,
      valley: task.valle ? {
        id: task.valle.id_valle,
        name: task.valle.valle_name
      } : null,
      faena: task.faena ? {
        id: task.faena.id_faena,
        name: task.faena.faena_name
      } : null,
      status: task.tarea_estado ? {
        id: task.tarea_estado.id_tarea_estado,
        name: task.tarea_estado.estado
      } : null
    };
  }

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.tarea.create({
      data: this.mapToDatabase(createTaskDto),
      include: {
        tarea_estado: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      }
    });
    return this.mapFromDatabase(task);
  }

  async findAll() {
    const tasks = await this.prisma.tarea.findMany({
      select: {
        id_tarea: true,
        nombre: true,
        descripcion: true,
        id_valle: true,
        id_faena: true,
        id_estado: true,
        valle: {
          select: {
            id_valle: true,
            valle_name: true
          }
        },
        faena: {
          select: {
            id_faena: true,
            faena_name: true
          }
        }
      }
    });
    return tasks.map(task => ({
      id: task.id_tarea,
      name: task.nombre,
      description: task.descripcion,
      valleyId: task.id_valle,
      faenaId: task.id_faena,
      statusId: task.id_estado,
      valley: task.valle ? {
        id: task.valle.id_valle,
        name: task.valle.valle_name
      } : null,
      faena: task.faena ? {
        id: task.faena.id_faena,
        name: task.faena.faena_name
      } : null
    }));
  }

  /* Comentando temporalmente findAllDetailed
  async findAllDetailed(query: any) {
    const tasks = await this.prisma.tarea.findMany({
      where: query,
      include: {
        tarea_estado: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      }
    });
    return tasks.map(task => this.mapFromDatabase(task));
  }
  */

  async findOne(id: string) {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: id },
      include: {
        tarea_estado: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
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
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      }
    });
    return this.mapFromDatabase(task);
  }

  async remove(id: string) {
    const task = await this.prisma.tarea.delete({
      where: { id_tarea: id },
      include: {
        tarea_estado: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      }
    });
    return this.mapFromDatabase(task);
  }

  /* Comentando temporalmente los métodos que no son parte del CRUD básico
  async getTaskProgress(id: string) {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: id },
      include: {
        subtareas: {
          include: {
            subtarea_estado: true,
          },
        },
      },
    });

    if (!task || !task.subtareas.length) {
      return {
        progress: 0,
        totalSubtasks: 0,
        completedSubtasks: 0,
        subtasksProgress: [],
      };
    }

    const totalSubtasks = task.subtareas.length;
    const subtasksProgress = task.subtareas.map(subtask => ({
      id: subtask.id_subtarea,
      name: subtask.nombre,
      status: subtask.subtarea_estado.estado,
      percentage: subtask.subtarea_estado.porcentaje,
    }));

    const totalProgress = subtasksProgress.reduce(
      (sum, subtask) => sum + subtask.percentage,
      0
    );
    const averageProgress = totalProgress / totalSubtasks;

    return {
      progress: Math.round(averageProgress),
      totalSubtasks,
      completedSubtasks: subtasksProgress.filter(st => st.percentage === 100).length,
      subtasksProgress,
    };
  }

  async getTaskSubtasks(id: string) {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: id },
      include: {
        subtareas: {
          include: {
            subtarea_estado: true,
            prioridad: true,
            beneficiario: true,
            documentos: true,
            cumplimientos: {
              include: {
                cumplimiento_estado: true,
                registros: {
                  include: {
                    memos: true,
                    solpeds: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    return task.subtareas.map(subtask => ({
      id: subtask.id_subtarea,
      taskId: subtask.id_tarea,
      number: subtask.numero,
      name: subtask.nombre,
      description: subtask.descripcion,
      budget: subtask.presupuesto,
      expense: subtask.gasto,
      startDate: subtask.fecha_inicio,
      endDate: subtask.fecha_termino,
      finalDate: subtask.fecha_final,
      beneficiaryId: subtask.id_beneficiario,
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
      } : null,
      beneficiary: subtask.beneficiario ? {
        id: subtask.beneficiario.id_beneficiario,
        legalName: subtask.beneficiario.nombre_legal,
        rut: subtask.beneficiario.rut,
        address: subtask.beneficiario.direccion,
        entityType: subtask.beneficiario.tipo_entidad,
        representative: subtask.beneficiario.representante,
        hasLegalPersonality: subtask.beneficiario.personalidad_juridica
      } : null,
      documents: subtask.documentos.map(doc => ({
        id: doc.id_documento,
        type: doc.tipo_documento,
        path: doc.ruta,
        uploadDate: doc.fecha_carga
      })),
      compliances: subtask.cumplimientos.map(comp => ({
        id: comp.id_cumplimiento,
        statusId: comp.id_cumplimiento_estado,
        applies: comp.aplica,
        status: comp.cumplimiento_estado ? {
          id: comp.cumplimiento_estado.id_cumplimiento_estado,
          name: comp.cumplimiento_estado.estado
        } : null,
        records: comp.registros.map(record => ({
          id: record.id_registro,
          hes: record.hes,
          hem: record.hem,
          provider: record.proveedor,
          startDate: record.fecha_inicio,
          endDate: record.fecha_termino,
          memos: record.memos.map(memo => ({
            id: memo.id_memo,
            value: memo.valor
          })),
          solpeds: record.solpeds.map(solped => ({
            id: solped.id_solped,
            ceco: solped.ceco,
            account: solped.cuenta,
            value: solped.valor
          }))
        }))
      }))
    }));
  }

  async getTotalBudget(id: string) {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: id },
      include: {
        subtareas: true
      }
    });

    if (!task) {
      return null;
    }

    const subtasksBudget = task.subtareas.reduce((total, subtask) => {
      return total + (subtask.presupuesto || 0);
    }, 0);

    return {
      taskId: task.id_tarea,
      taskName: task.nombre,
      totalBudget: subtasksBudget,
      subtasksCount: task.subtareas.length,
      subtasks: task.subtareas.map(subtask => ({
        id: subtask.id_subtarea,
        name: subtask.nombre,
        budget: subtask.presupuesto
      }))
    };
  }

  async getTotalExpense(id: string) {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: id },
      include: {
        subtareas: true
      }
    });

    if (!task) {
      return null;
    }

    const subtasksExpense = task.subtareas.reduce((total, subtask) => {
      return total + (subtask.gasto || 0);
    }, 0);

    return {
      taskId: task.id_tarea,
      taskName: task.nombre,
      totalExpense: subtasksExpense,
      subtasksCount: task.subtareas.length,
      subtasks: task.subtareas.map(subtask => ({
        id: subtask.id_subtarea,
        name: subtask.nombre,
        expense: subtask.gasto
      }))
    };
  }

  async getValleyTasksCount(valleyId: number) {
    const count = await this.prisma.tarea.count({
      where: {
        id_valle: valleyId
      }
    });

    return {
      valleyId,
      totalTasks: count
    };
  }

  async getInvestmentTasksCount(investmentId: number) {
    const count = await this.prisma.tarea.count({
      where: {
        info_tarea: {
          id_inversion: investmentId
        }
      }
    });

    return {
      investmentId,
      totalTasks: count
    };
  }

  async getValleyInvestmentTasksCount(valleyId: number, investmentId: number) {
    const count = await this.prisma.tarea.count({
      where: {
        AND: [
          { id_valle: valleyId },
          {
            info_tarea: {
              id_inversion: investmentId
            }
          }
        ]
      }
    });

    return {
      valleyId,
      investmentId,
      totalTasks: count
    };
  }

  async getTaskInfo(id: string) {
    const taskInfo = await this.prisma.info_tarea.findUnique({
      where: { id_tarea: id },
      include: {
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    if (!taskInfo) {
      return null;
    }

    return {
      taskId: id,
      origin: taskInfo.origen ? {
        id: taskInfo.origen.id_origen,
        name: taskInfo.origen.origen_name
      } : null,
      investment: taskInfo.inversion ? {
        id: taskInfo.inversion.id_inversion,
        line: taskInfo.inversion.linea
      } : null,
      type: taskInfo.tipo ? {
        id: taskInfo.tipo.id_tipo,
        name: taskInfo.tipo.tipo_name
      } : null,
      scope: taskInfo.alcance ? {
        id: taskInfo.alcance.id_alcance,
        name: taskInfo.alcance.alcance_name
      } : null,
      interaction: taskInfo.interaccion ? {
        id: taskInfo.interaccion.id_interaccion,
        operation: taskInfo.interaccion.operacion
      } : null,
      risk: taskInfo.riesgo ? {
        id: taskInfo.riesgo.id_riesgo,
        type: taskInfo.riesgo.tipo_riesgo
      } : null
    };
  }
  */
} 