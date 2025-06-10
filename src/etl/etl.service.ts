import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { SubtasksService } from '../subtasks/subtasks.service';
import { InfoService } from '../info/info.service';
import { DocumentsService } from '../documents/documents.service';
import * as XLSX from 'xlsx';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { CreateSubtaskDto } from '../subtasks/dto/create-subtask.dto';
import { CreateInfoTaskInput } from '../graphql/graphql.types';

const valleyMap: Record<string, number> = {
  'Huasco': 2,
  'Copiapó': 1,
  'Elqui': 3,
  'Transversal': 4,
};

const faenaMap: Record<string, number> = {
  'Mina Cerro Negro Norte': 1,
  'Planta Magnetita': 2,
  'Puerto Punta Totoralillo': 3,
  'Mina Los Colorados': 4,
  'Planta De Pellets': 5,
  'Puerto Guacolda II': 6,
  'Minas El Romeral': 7,
  'Mina De Pleito': 8,
  'Puerto Guayacán': 9,
  'Transversal': 10,
};

const processMap: Record<string, number> = {
  'Relacionamiento VC': 1,
  'Relacionamiento VH': 2,
  'Relacionamiento VE': 3,
  'Comunicaciones Internas': 4,
  'Comunicaciones Externas': 5,
  'Asuntos Públicos': 6,
  'Transversales': 7,
  'Otro': 8,
};

const originMap: Record<string, number> = {
  'Resolución Calificación Ambiental (RCA)': 1,
  'Compromiso Ambiental Voluntario (CAV)': 2,
  'Compromiso Histórico y/o por Controversia Operacional': 3,
  'Instancia Formal de Relacionamiento': 4,
  'Habilitación de continuidad operacional, permisos y proyectos': 5,
  'Arrastre de compromisos sin cumplimiento': 6,
  'Mesa de Trabajo': 7,
  'No Ingresado': 8,
};

const investmentMap: Record<string, number> = {
  'Desarrollo productivo': 1,
  'Identidad y cultura': 2,
  'Formación y Educación': 3,
  'Habitabilidad e infraestructura comunitaria': 4,
  'Calidad de Vida': 5,
  'No Ingresado': 6,
};

const typeMap: Record<string, number> = {
  'Programas de desarrollo comunitario': 1,
  'Fondos de Inversión Social': 2,
  'Auspicios y donaciones': 3,
  'Proyecto': 4,
  'No Ingresado': 5,
};

const scopeMap: Record<string, number> = {
  'Regional': 1,
  'Provincial': 2,
  'Comunal': 3,
  'Local/Comunitario (especificar territorio)': 4,
  'No Ingresado': 5,
};

const interactionMap: Record<string, number> = {
  'Mina': 1,
  'Planta': 2,
  'Puerto': 3,
  'Línea Férrea': 4,
  'Tránsito de Camiones': 5,
  'Relaves y/o Concentraducto/Acueducto': 6,
  'Proyectos de continuidad operacional y desarrollo': 7,
  'Transversal': 8,
  'No Ingresado': 9,
};

const riskMap: Record<string, number> = {
  'Comunitario': 1,
  'Reputacional': 2,
  'Cumplimiento': 3,
  'Ambiental': 4,
  'GRP Personas, Procesos, Activos': 5,
  'No Ingresado': 6,
};

@Injectable()
export class EtlService {
  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService,
    private subtasksService: SubtasksService,
    private infoService: InfoService,
    private documentsService: DocumentsService,
  ) {}

  async processExcelFile(file: Express.Multer.File) {
    try {
      // Subir archivo a Azure Blob Storage
      const blobInfo = await this.documentsService.uploadBlobOnly(file);
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      // Procesar hoja 'Tareas'
      const worksheetTareas = workbook.Sheets['Tareas'];
      let tareasResults = { success: 0, failed: 0, errors: [] as string[] };
      if (worksheetTareas) {
        const dataTareas = XLSX.utils.sheet_to_json(worksheetTareas);
        for (const row of dataTareas) {
          try {
            const taskDto: CreateTaskDto = {
              name: row['Nombre'],
              description: row['Descripción'],
              valleyId: valleyMap[row['Valle']] ?? null,
              faenaId: faenaMap[row['Faena']] ?? null,
              processId: processMap[row['Proceso']] ?? null,
              statusId: 1,
              applies: (row['Cumplimiento']?.toString().toUpperCase() === 'SI'),
            };
            await this.tasksService.create(taskDto);
            tareasResults.success++;
          } catch (error) {
            tareasResults.failed++;
            tareasResults.errors.push(`Error en fila: ${JSON.stringify(row)} - ${error.message}`);
          }
        }
      }

      // Procesar hoja 'Info'
      const worksheetInfo = workbook.Sheets['Info'];
      let infoResults = { success: 0, failed: 0, errors: [] as string[] };
      if (worksheetInfo) {
        const dataInfo = XLSX.utils.sheet_to_json(worksheetInfo);
        for (const row of dataInfo) {
          try {
            // Buscar la tarea por nombre
            const task = await this.prisma.tarea.findFirst({
              where: { nombre: row['Nombre'] },
            });
            if (!task) {
              throw new Error(`No se encontró la tarea con nombre: ${row['Nombre']}`);
            }
            const infoDto = {
              taskId: task.id_tarea,
              originId: originMap[row['Origen']] ?? null,
              investmentId: investmentMap[row['Línea Inversión']] ?? null,
              typeId: typeMap[row['Tipo Iniciativa']] ?? null,
              scopeId: scopeMap[row['Alcance']] ?? null,
              interactionId: interactionMap[row['Interacción']] ?? null,
              riskId: riskMap[row['Riesgo']] ?? null,
            };
            await this.infoService.create(infoDto);
            infoResults.success++;
          } catch (error) {
            infoResults.failed++;
            infoResults.errors.push(`Error en fila: ${JSON.stringify(row)} - ${error.message}`);
          }
        }
      }

      return {
        tareas: tareasResults,
        info: infoResults,
        documentInfo: blobInfo,
      };
    } catch (error) {
      throw new BadRequestException(`Error procesando el archivo Excel: ${error.message}`);
    }
  }
} 