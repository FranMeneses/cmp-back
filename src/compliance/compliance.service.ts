import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(complianceDto: CreateComplianceDto | UpdateComplianceDto) {
    return {
      id_subtarea: complianceDto.subtaskId,
      id_cumplimiento_estado: complianceDto.statusId,
      aplica: complianceDto.applies,
    };
  }

  private mapFromDatabase(compliance: any) {
    return {
      id: compliance.id_cumplimiento,
      subtaskId: compliance.id_subtarea,
      statusId: compliance.id_cumplimiento_estado,
      applies: compliance.aplica,
      subtask: compliance.subtarea,
      status: compliance.cumplimiento_estado,
      records: compliance.registros?.map(record => ({
        id: record.id_registro,
        subtaskId: record.id_subtarea,
        complianceId: record.id_cumplimiento,
        hes: record.hes,
        hem: record.hem,
        provider: record.proveedor,
        startDate: record.fecha_inicio,
        endDate: record.fecha_termino,
        memos: record.memos,
        solpeds: record.solpeds,
      })),
    };
  }

  async create(createComplianceDto: CreateComplianceDto) {
    const compliance = await this.prisma.cumplimiento.create({
      data: this.mapToDatabase(createComplianceDto),
    });
    return this.mapFromDatabase(compliance);
  }

  async findAll(query: any) {
    const compliances = await this.prisma.cumplimiento.findMany({
      where: query,
      include: {
        subtarea: true,
        cumplimiento_estado: true,
        registros: {
          include: {
            memos: true,
            solpeds: true,
          },
        },
      },
    });
    return compliances.map(compliance => this.mapFromDatabase(compliance));
  }

  async findOne(id: string) {
    const compliance = await this.prisma.cumplimiento.findUnique({
      where: { id_cumplimiento: id },
      include: {
        subtarea: true,
        cumplimiento_estado: true,
        registros: {
          include: {
            memos: true,
            solpeds: true,
          },
        },
      },
    });
    return compliance ? this.mapFromDatabase(compliance) : null;
  }

  async update(id: string, updateComplianceDto: UpdateComplianceDto) {
    const compliance = await this.prisma.cumplimiento.update({
      where: { id_cumplimiento: id },
      data: this.mapToDatabase(updateComplianceDto),
    });
    return this.mapFromDatabase(compliance);
  }

  async remove(id: string) {
    const compliance = await this.prisma.cumplimiento.delete({
      where: { id_cumplimiento: id },
    });
    return this.mapFromDatabase(compliance);
  }
} 