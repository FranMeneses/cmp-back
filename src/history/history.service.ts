import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(
    private prisma: PrismaService
  ) {}

  private mapToGraphql(history: any) {
    return {
      id: history.id_historial,
      name: history.nombre,
      processId: history.id_proceso,
      finalDate: history.fecha_final,
      totalExpense: history.gasto_total,
      valleyId: history.id_valle,
      faenaId: history.id_faena,
      beneficiaryId: history.beneficiario,
      solpedMemoSap: history.SOLPED_MEMO_SAP,
      hesHemSap: history.HES_HEM_SAP,
      process: history.proceso ? {
        id: history.proceso.id_proceso,
        name: history.proceso.proceso_name
      } : null,
      valley: history.valle ? {
        id: history.valle.id_valle,
        name: history.valle.valle_name
      } : null,
      faena: history.faena ? {
        id: history.faena.id_faena,
        name: history.faena.faena_name
      } : null,
      beneficiary: history.beneficiario_rel ? {
        id: history.beneficiario_rel.id_beneficiario,
        legalName: history.beneficiario_rel.nombre_legal,
        rut: history.beneficiario_rel.rut,
        address: history.beneficiario_rel.direccion,
        entityType: history.beneficiario_rel.tipo_entidad,
        representative: history.beneficiario_rel.representante,
        hasLegalPersonality: history.beneficiario_rel.personalidad_juridica
      } : null,
      documents: history.historial_doc?.map(doc => ({
        id: doc.id_his_doc,
        historyId: doc.id_historial,
        fileName: doc.nombre_archivo,
        documentTypeId: doc.tipo_documento,
        path: doc.ruta,
        uploadDate: doc.fecha_carga,
        documentType: doc.tipo_doc ? {
          id: doc.tipo_doc.id_tipo_documento,
          tipo_documento: doc.tipo_doc.tipo_documento
        } : null
      })) || []
    };
  }

  async findAll() {
    const histories = await this.prisma.historial.findMany({
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  async findOne(id: string) {
    const history = await this.prisma.historial.findUnique({
      where: { id_historial: id },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      }
    });
    return history ? this.mapToGraphql(history) : null;
  }

  async findByProcess(processId: number) {
    const histories = await this.prisma.historial.findMany({
      where: { id_proceso: processId },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  async findByValley(valleyId: number) {
    const histories = await this.prisma.historial.findMany({
      where: { id_valle: valleyId },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  async findByFaena(faenaId: number) {
    const histories = await this.prisma.historial.findMany({
      where: { id_faena: faenaId },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }

  async findByBeneficiary(beneficiaryId: string) {
    const histories = await this.prisma.historial.findMany({
      where: { beneficiario: beneficiaryId },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        beneficiario_rel: true,
        historial_doc: {
          include: {
            tipo_doc: true
          }
        }
      },
      orderBy: {
        fecha_final: 'desc'
      }
    });
    return histories.map(this.mapToGraphql);
  }
} 