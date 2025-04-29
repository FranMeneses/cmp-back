import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SubtasksService } from '../subtasks/subtasks.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private subtasksService: SubtasksService
  ) {}

  private mapToDatabase(taskDto: CreateTaskDto | UpdateTaskDto) {
    return {
      nombre: taskDto.name,
      descripcion: taskDto.description,
      id_valle: taskDto.valleyId,
      id_faena: taskDto.faenaId,
      id_estado: taskDto.statusId
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
        valle: true,
        faena: true
      }
    });
    return this.mapFromDatabase(task);
  }

  async findAll() {
    const tasks = await this.prisma.tarea.findMany({
      include: {
        tarea_estado: true,
        valle: true,
        faena: true
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
        faena: true
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
        faena: true
      }
    });
    return this.mapFromDatabase(task);
  }

  async remove(id: string) {
    const task = await this.prisma.tarea.delete({
      where: { id_tarea: id },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true
      }
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

  /*
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