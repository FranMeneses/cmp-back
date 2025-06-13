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
      solpedMemoSap: history.SOLPED_MEMO_SAP,
      hesHemSap: history.HES_HEM_SAP,
      process: history.proceso,
      valley: history.valle,
      faena: history.faena,
      documents: history.historial_doc,
    };
  }

  async findAll() {
    const histories = await this.prisma.historial.findMany({
      include: {
        proceso: true,
        valle: true,
        faena: true,
        historial_doc: true
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
        historial_doc: true
      }
    });
    return history ? this.mapToGraphql(history) : null;
  }
} 