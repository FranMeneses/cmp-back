import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  // Mapping methods
  private mapToDatabase(dto: CreateComplianceDto | UpdateComplianceDto) {
    const mappedData: any = {};
    
    if ('taskId' in dto && dto.taskId) {
      mappedData.id_tarea = dto.taskId;
    }
    
    if ('statusId' in dto && dto.statusId !== undefined) {
      mappedData.id_cump_est = dto.statusId;
    }
    
    // Solo incluir campos de UpdateComplianceDto si están presentes
    if ('valor' in dto && dto.valor !== undefined) {
      mappedData.valor = dto.valor;
    }
    
    if ('ceco' in dto && dto.ceco !== undefined) {
      mappedData.ceco = dto.ceco;
    }
    
    if ('cuenta' in dto && dto.cuenta !== undefined) {
      mappedData.cuenta = dto.cuenta;
    }
    
    if ('solpedMemoSap' in dto && dto.solpedMemoSap !== undefined) {
      mappedData.SOLPED_MEMO_SAP = dto.solpedMemoSap;
    }
    
    if ('hesHemSap' in dto && dto.hesHemSap !== undefined) {
      mappedData.HES_HEM_SAP = dto.hesHemSap;
    }
    
    return mappedData;
  }

  private mapFromDatabase(compliance: any) {
    return {
      id: compliance.id_cumplimiento,
      taskId: compliance.id_tarea,
      statusId: compliance.id_cump_est,
      updatedAt: compliance.updated_at,
      valor: compliance.valor,
      ceco: compliance.ceco,
      cuenta: compliance.cuenta,
      solpedMemoSap: compliance.SOLPED_MEMO_SAP,
      hesHemSap: compliance.HES_HEM_SAP,
      task: compliance.tarea ? {
        id: compliance.tarea.id_tarea,
        name: compliance.tarea.nombre,
        description: compliance.tarea.descripcion,
        statusId: compliance.tarea.estado
      } : null,
      status: compliance.cumplimiento_estado ? {
        id: compliance.cumplimiento_estado.id_cumplimiento_estado,
        name: compliance.cumplimiento_estado.estado,
        days: compliance.cumplimiento_estado.dias
      } : null
    };
  }

  // Compliance CRUD
  async create(createComplianceDto: CreateComplianceDto) {
    // Verificar que no exista ya un cumplimiento para esta tarea
    const existingCompliance = await this.prisma.cumplimiento.findFirst({
      where: { id_tarea: createComplianceDto.taskId }
    });

    if (existingCompliance) {
      throw new BadRequestException('Ya existe un cumplimiento asociado a esta tarea');
    }

    // Verificar que la tarea existe y aplica cumplimiento
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: createComplianceDto.taskId }
    });

    if (!task) {
      throw new BadRequestException('La tarea especificada no existe');
    }

    if (!task.aplica) {
      throw new BadRequestException('Esta tarea no aplica para cumplimiento');
    }

    const compliance = await this.prisma.cumplimiento.create({
      data: this.mapToDatabase(createComplianceDto),
      include: {
        tarea: true,
        cumplimiento_estado: true
      }
    });

    return this.mapFromDatabase(compliance);
  }

  async findAll() {
    const compliances = await this.prisma.cumplimiento.findMany({
      include: {
        tarea: true,
        cumplimiento_estado: true
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    return compliances.map(compliance => this.mapFromDatabase(compliance));
  }

  async findOne(id: string) {
    const compliance = await this.prisma.cumplimiento.findUnique({
      where: { id_cumplimiento: id },
      include: {
        tarea: true,
        cumplimiento_estado: true
      }
    });

    if (!compliance) return null;
    return this.mapFromDatabase(compliance);
  }

  async update(id: string, updateComplianceDto: UpdateComplianceDto) {
    // Verificar que el cumplimiento existe
    const existingCompliance = await this.prisma.cumplimiento.findUnique({
      where: { id_cumplimiento: id }
    });

    if (!existingCompliance) {
      throw new BadRequestException('El cumplimiento especificado no existe');
    }

    const compliance = await this.prisma.cumplimiento.update({
      where: { id_cumplimiento: id },
      data: this.mapToDatabase(updateComplianceDto),
      include: {
        tarea: true,
        cumplimiento_estado: true
      }
    });

    return this.mapFromDatabase(compliance);
  }

  async remove(id: string) {
    const compliance = await this.prisma.cumplimiento.findUnique({
      where: { id_cumplimiento: id }
    });

    if (!compliance) {
      throw new BadRequestException('El cumplimiento especificado no existe');
    }

    await this.prisma.cumplimiento.delete({
      where: { id_cumplimiento: id }
    });

    return { message: 'Cumplimiento eliminado exitosamente' };
  }

  // Método para obtener cumplimiento por tarea
  async getTaskCompliance(taskId: string) {
    const compliance = await this.prisma.cumplimiento.findFirst({
      where: { id_tarea: taskId },
      include: {
        tarea: true,
        cumplimiento_estado: true
      }
    });

    if (!compliance) return null;
    return this.mapFromDatabase(compliance);
  }

  // Método para obtener todos los estados de cumplimiento
  async getAllComplianceStatuses() {
    const statuses = await this.prisma.cumplimiento_estado.findMany({
      orderBy: { id_cumplimiento_estado: 'asc' }
    });

    return statuses.map(status => ({
      id: status.id_cumplimiento_estado,
      name: status.estado,
      days: status.dias
    }));
  }

  // Método para avanzar el estado de cumplimiento
  async advanceStatus(id: string) {
    const compliance = await this.prisma.cumplimiento.findUnique({
      where: { id_cumplimiento: id },
      include: { cumplimiento_estado: true }
    });

    if (!compliance) {
      throw new BadRequestException('El cumplimiento especificado no existe');
    }

    const currentStatusId = compliance.id_cump_est;
    const nextStatusId = currentStatusId + 1;

    // Verificar que existe el siguiente estado
    const nextStatus = await this.prisma.cumplimiento_estado.findUnique({
      where: { id_cumplimiento_estado: nextStatusId }
    });

    if (!nextStatus) {
      throw new BadRequestException('No existe un estado siguiente al actual');
    }

    const updatedCompliance = await this.prisma.cumplimiento.update({
      where: { id_cumplimiento: id },
      data: { id_cump_est: nextStatusId },
      include: {
        tarea: true,
        cumplimiento_estado: true
      }
    });

    return this.mapFromDatabase(updatedCompliance);
  }

  // Método para obtener cumplimientos por estado
  async getCompliancesByStatus(statusId: number) {
    const compliances = await this.prisma.cumplimiento.findMany({
      where: { id_cump_est: statusId },
      include: {
        tarea: true,
        cumplimiento_estado: true
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    return compliances.map(compliance => this.mapFromDatabase(compliance));
  }

  // Método para obtener cumplimientos activos (no completados)
  async getActiveCompliances() {
    // Obtener el ID del estado "Completado"
    const completedStatus = await this.prisma.cumplimiento_estado.findFirst({
      where: { estado: 'Completado' }
    });

    const compliances = await this.prisma.cumplimiento.findMany({
      where: {
        id_cump_est: {
          not: completedStatus?.id_cumplimiento_estado || 999
        }
      },
      include: {
        tarea: true,
        cumplimiento_estado: true
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    return compliances.map(compliance => this.mapFromDatabase(compliance));
  }
} 