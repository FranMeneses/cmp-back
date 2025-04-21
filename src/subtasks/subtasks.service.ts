import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(subtaskDto: CreateSubtaskDto | UpdateSubtaskDto) {
    return {
      id_tarea: subtaskDto.taskId,
      numero: subtaskDto.number,
      nombre: subtaskDto.name,
      descripcion: subtaskDto.description,
      presupuesto: subtaskDto.budget,
      gasto: subtaskDto.expense,
      fecha_inicio: subtaskDto.startDate,
      fecha_termino: subtaskDto.endDate,
      fecha_final: subtaskDto.finalDate,
      id_beneficiario: subtaskDto.beneficiaryId,
      id_estado: subtaskDto.statusId,
      id_prioridad: subtaskDto.priorityId,
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
      documents: subtask.documentos?.map(doc => ({
        id: doc.id_documento,
        type: doc.tipo_documento,
        path: doc.ruta,
        uploadDate: doc.fecha_carga
      })) || [],
      compliances: subtask.cumplimientos?.map(comp => ({
        id: comp.id_cumplimiento,
        statusId: comp.id_cumplimiento_estado,
        applies: comp.aplica,
        status: comp.cumplimiento_estado ? {
          id: comp.cumplimiento_estado.id_cumplimiento_estado,
          name: comp.cumplimiento_estado.estado
        } : null,
        records: comp.registros?.map(record => ({
          id: record.id_registro,
          hes: record.hes,
          hem: record.hem,
          provider: record.proveedor,
          startDate: record.fecha_inicio,
          endDate: record.fecha_termino,
          memos: record.memos?.map(memo => ({
            id: memo.id_memo,
            value: memo.valor
          })) || [],
          solpeds: record.solpeds?.map(solped => ({
            id: solped.id_solped,
            ceco: solped.ceco,
            account: solped.cuenta,
            value: solped.valor
          })) || []
        })) || []
      })) || []
    };
  }

  async create(createSubtaskDto: CreateSubtaskDto) {
    const subtask = await this.prisma.subtarea.create({
      data: this.mapToDatabase(createSubtaskDto),
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
    });
    return this.mapFromDatabase(subtask);
  }

  async findAll(query: any) {
    const subtasks = await this.prisma.subtarea.findMany({
      where: query,
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
    });
    return subtasks.map(subtask => this.mapFromDatabase(subtask));
  }

  async findOne(id: string) {
    const subtask = await this.prisma.subtarea.findUnique({
      where: { id_subtarea: id },
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
    });
    return this.mapFromDatabase(subtask);
  }

  async remove(id: string) {
    const subtask = await this.prisma.subtarea.delete({
      where: { id_subtarea: id },
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
    });
    return this.mapFromDatabase(subtask);
  }
} 