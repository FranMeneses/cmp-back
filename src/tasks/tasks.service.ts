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
        fecha_final: {
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
        fecha_final: {
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

  async getTotalExpenseByMonthAndValley(monthName: string, year: number, valleyId: number) {
    const monthId = this.getMonthNumber(monthName);
    
    const tasks = await this.prisma.tarea.findMany({
      where: { id_valle: valleyId },
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
        fecha_final: {
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

  async getTotalBudgetByMonthAndValley(monthName: string, year: number, valleyId: number) {
    const monthId = this.getMonthNumber(monthName);
    
    const tasks = await this.prisma.tarea.findMany({
      where: { id_valle: valleyId },
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
        fecha_final: {
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
        faena: true
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

  async getValleyMonthlyBudgets(valleyId: number, year: number) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const monthlyBudgets = await Promise.all(
      months.map(async (month) => {
        const budget = await this.getTotalBudgetByMonthAndValley(month, year, valleyId);
        return {
          month,
          budget
        };
      })
    );

    return monthlyBudgets;
  }

  async getValleyMonthlyExpenses(valleyId: number, year: number) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const monthlyExpenses = await Promise.all(
      months.map(async (month) => {
        const expense = await this.getTotalExpenseByMonthAndValley(month, year, valleyId);
        return {
          month,
          expense
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

  //faenas por valle
} 