import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(subtaskDto: CreateSubtaskDto | UpdateSubtaskDto) {
    return {
      nombre: subtaskDto.nombre,
      descripcion: subtaskDto.descripcion,
      numero: 0, // Valor por defecto para el campo requerido
      tarea: subtaskDto.id_tarea ? {
        connect: {
          id_tarea: String(subtaskDto.id_tarea)
        }
      } : undefined,
      subtarea_estado: subtaskDto.id_estado ? {
        connect: {
          id_subtarea_estado: subtaskDto.id_estado
        }
      } : undefined,
      prioridad: subtaskDto.id_prioridad ? {
        connect: {
          id_prioridad: subtaskDto.id_prioridad
        }
      } : undefined,
      beneficiario: subtaskDto.id_beneficiario ? {
        connect: {
          id_beneficiario: String(subtaskDto.id_beneficiario)
        }
      } : undefined,
      presupuesto: subtaskDto.presupuesto,
      gasto: subtaskDto.gasto,
      fecha_inicio: subtaskDto.fecha_inicio,
      fecha_termino: subtaskDto.fecha_termino,
      fecha_final: subtaskDto.fecha_final
    };
  }

  private mapFromDatabase(subtask: any) {
    return {
      id: subtask.id_subtarea,
      nombre: subtask.nombre,
      descripcion: subtask.descripcion,
      id_tarea: subtask.id_tarea,
      id_estado: subtask.id_estado,
      id_prioridad: subtask.id_prioridad,
      id_beneficiario: subtask.id_beneficiario,
      presupuesto: subtask.presupuesto,
      gasto: subtask.gasto,
      fecha_inicio: subtask.fecha_inicio,
      fecha_termino: subtask.fecha_termino,
      fecha_final: subtask.fecha_final,
      estado: subtask.subtarea_estado ? {
        id: subtask.subtarea_estado.id_subtarea_estado,
        nombre: subtask.subtarea_estado.estado,
        porcentaje: subtask.subtarea_estado.porcentaje
      } : null,
      prioridad: subtask.prioridad ? {
        id: subtask.prioridad.id_prioridad,
        nombre: subtask.prioridad.prioridad_name
      } : null,
      beneficiario: subtask.beneficiario ? {
        id: subtask.beneficiario.id_beneficiario,
        nombre_legal: subtask.beneficiario.nombre_legal,
        rut: subtask.beneficiario.rut,
        direccion: subtask.beneficiario.direccion,
        tipo_entidad: subtask.beneficiario.tipo_entidad,
        representante: subtask.beneficiario.representante,
        personalidad_juridica: subtask.beneficiario.personalidad_juridica
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