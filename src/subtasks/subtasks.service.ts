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
      tarea: dto.taskId ? {
        connect: {
          id_tarea: dto.taskId
        }
      } : undefined,
      subtarea_estado: dto.statusId ? {
        connect: {
          id_subtarea_estado: dto.statusId
        }
      } : undefined,
      prioridad: dto.priorityId ? {
        connect: {
          id_prioridad: dto.priorityId
        }
      } : undefined,
      beneficiario: dto.beneficiaryId ? {
        connect: {
          id_beneficiario: dto.beneficiaryId
        }
      } : undefined,
      presupuesto: dto.budget,
      gasto: dto.expense,
      fecha_inicio: dto.startDate,
      fecha_termino: dto.endDate,
      fecha_final: dto.finalDate,
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
      beneficiary: subtask.beneficiario ? {
        id: subtask.beneficiario.id_beneficiario,
        legalName: subtask.beneficiario.nombre_legal,
        rut: subtask.beneficiario.rut,
        address: subtask.beneficiario.direccion,
        entityType: subtask.beneficiario.tipo_entidad,
        representative: subtask.beneficiario.representante,
        hasLegalPersonality: subtask.beneficiario.personalidad_juridica
      } : null,
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
        prioridad: true,
        beneficiario: true
      }
    });
    return this.mapFromDatabase(subtask);
  }

  async findAll(query: any) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: query,
      include: {
        subtarea_estado: true,
        prioridad: true,
        beneficiario: true
      }
    });
    return subtasks.map(subtask => this.mapFromDatabase(subtask));
  }

  async findOne(id: string) {
    const subtask = await this.prisma.subtarea.findUnique({
      where: { id_subtarea: id },
      include: {
        subtarea_estado: true,
        prioridad: true,
        beneficiario: true
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
        prioridad: true,
        beneficiario: true
      }
    });
    return this.mapFromDatabase(subtask);
  }

  async remove(id: string) {
    const subtask = await this.prisma.subtarea.delete({
      where: { id_subtarea: id },
      include: {
        subtarea_estado: true,
        prioridad: true,
        beneficiario: true
      }
    });
    return this.mapFromDatabase(subtask);
  }
} 