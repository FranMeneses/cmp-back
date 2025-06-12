import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class HistoryService {
  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService
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

  async createHistoryFromTask(taskId: string): Promise<any> {
    // Get the task with all its related data
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: taskId },
      include: {
        tarea_estado: true,
        valle: true,
        faena: true,
        proceso_rel: true
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Get total expense from subtasks
    const totalExpense = await this.tasksService.getTotalExpense(taskId);

    // Create history record
    const history = await this.prisma.historial.create({
      data: {
        nombre: task.nombre,
        id_proceso: task.proceso,
        fecha_final: new Date(), // Fecha en que se completó la tarea
        gasto_total: totalExpense,
        id_valle: task.id_valle,
        id_faena: task.id_faena
      },
      include: {
        proceso: true,
        valle: true,
        faena: true,
        historial_doc: true
      }
    });

    return this.mapToGraphql(history);
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