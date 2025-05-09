import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(dto: CreateSubtaskDto | UpdateSubtaskDto) {
    return {
      numero: dto.number,
      nombre: dto.name,
      descripcion: dto.description,
      presupuesto: dto.budget,
      gasto: dto.expense,
      fecha_inicio: dto.startDate,
      fecha_termino: dto.endDate,
      fecha_final: dto.finalDate,
      id_beneficiario: dto.beneficiaryId,
      id_estado: dto.statusId,
      id_prioridad: dto.priorityId,
      id_tarea: dto.taskId
    };
  }

  private mapFromDatabase(subtask: any) {
    return {
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
} 