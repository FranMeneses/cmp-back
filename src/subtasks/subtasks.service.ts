import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

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

  async findAll() {
    const subtasks = await this.prisma.subtarea.findMany({
      include: {
        subtarea_estado: true,
        prioridad: true
      }
    });
    return subtasks.map(subtask => this.mapFromDatabase(subtask));
  }

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