import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(complianceDto: CreateComplianceDto | UpdateComplianceDto) {
    return {
      subtarea: complianceDto.id_subtarea ? {
        connect: {
          id_subtarea: String(complianceDto.id_subtarea)
        }
      } : undefined,
      cumplimiento_estado: complianceDto.id_cumplimiento_estado ? {
        connect: {
          id_cumplimiento_estado: complianceDto.id_cumplimiento_estado
        }
      } : undefined,
      aplica: Boolean(complianceDto.aplica)
    };
  }

  private mapFromDatabase(compliance: any) {
    return {
      id: compliance.id_cumplimiento,
      id_subtarea: compliance.id_subtarea,
      id_cumplimiento_estado: compliance.id_cumplimiento_estado,
      aplica: compliance.aplica ? 1 : 0,
      estado: compliance.cumplimiento_estado ? {
        id: compliance.cumplimiento_estado.id_cumplimiento_estado,
        nombre: compliance.cumplimiento_estado.estado
      } : null,
      registros: compliance.registro?.map(record => ({
        id: record.id_registro,
        hes: record.hes,
        hem: record.hem,
        proveedor: record.proveedor,
        fecha_inicio: record.fecha_inicio,
        fecha_termino: record.fecha_termino,
        memos: record.memo?.map(memo => ({
          id: memo.id_memo,
          valor: memo.valor
        })) || [],
        solpeds: record.solped?.map(solped => ({
          id: solped.id_solped,
          ceco: solped.ceco,
          cuenta: solped.cuenta,
          valor: solped.valor
        })) || []
      })) || []
    };
  }

  async create(createComplianceDto: CreateComplianceDto) {
    const compliance = await this.prisma.cumplimiento.create({
      data: this.mapToDatabase(createComplianceDto),
      include: {
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });
    return this.mapFromDatabase(compliance);
  }

  async findAll(query: any) {
    const compliances = await this.prisma.cumplimiento.findMany({
      where: query,
      include: {
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });
    return compliances.map(compliance => this.mapFromDatabase(compliance));
  }

  async findOne(id: string) {
    const compliance = await this.prisma.cumplimiento.findUnique({
      where: { id_cumplimiento: id },
      include: {
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });
    return compliance ? this.mapFromDatabase(compliance) : null;
  }

  async update(id: string, updateComplianceDto: UpdateComplianceDto) {
    const compliance = await this.prisma.cumplimiento.update({
      where: { id_cumplimiento: id },
      data: this.mapToDatabase(updateComplianceDto),
      include: {
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });
    return this.mapFromDatabase(compliance);
  }

  async remove(id: string) {
    const compliance = await this.prisma.cumplimiento.delete({
      where: { id_cumplimiento: id },
      include: {
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });
    return this.mapFromDatabase(compliance);
  }
} 