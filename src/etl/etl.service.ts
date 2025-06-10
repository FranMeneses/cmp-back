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

      // Leer solo la hoja 'Tareas'
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets['Tareas'];
      if (!worksheet) {
        throw new BadRequestException('La hoja "Tareas" no existe en el archivo Excel.');
      }
      const data = XLSX.utils.sheet_to_json(worksheet);

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
        documentInfo: blobInfo,
      };

      for (const row of data) {
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
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error en fila: ${JSON.stringify(row)} - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      throw new BadRequestException(`Error procesando el archivo Excel: ${error.message}`);
    }
  }
} 