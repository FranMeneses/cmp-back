import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { SubtasksService } from '../subtasks/subtasks.service';
import { InfoService } from '../info/info.service';
import { DocumentsService } from '../documents/documents.service';
import { ComplianceService } from '../compliance/compliance.service';
import * as XLSX from 'xlsx';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { CreateSubtaskDto } from '../subtasks/dto/create-subtask.dto';
import { CreateInfoTaskInput } from '../graphql/graphql.types';

@Injectable()
export class EtlService {
  // Cache para evitar consultas repetidas durante el procesamiento
  private cacheValley: Map<string, number> = new Map();
  private cacheFaena: Map<string, number> = new Map();
  private cacheProcess: Map<string, number> = new Map();
  private cacheOrigin: Map<string, number> = new Map();
  private cacheInvestment: Map<string, number> = new Map();
  private cacheType: Map<string, number> = new Map();
  private cacheScope: Map<string, number> = new Map();
  private cacheInteraction: Map<string, number> = new Map();
  private cacheRisk: Map<string, number> = new Map();

  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService,
    private subtasksService: SubtasksService,
    private infoService: InfoService,
    private documentsService: DocumentsService,
    private complianceService: ComplianceService,
  ) {}

  // Métodos dinámicos para obtener IDs desde la base de datos
  private async getValleyId(valleyName: string): Promise<number | null> {
    if (!valleyName) return null;
    
    if (this.cacheValley.has(valleyName)) {
      return this.cacheValley.get(valleyName)!;
    }

    // Intentar búsqueda exacta primero
    let valley = await this.prisma.valle.findFirst({
      where: { valle_name: valleyName }
    });

    // Si no encuentra exacta, buscar por contenido
    if (!valley) {
      valley = await this.prisma.valle.findFirst({
        where: {
          valle_name: {
            contains: valleyName
          }
        }
      });
    }

    const id = valley?.id_valle || null;
    if (id) this.cacheValley.set(valleyName, id);
    return id;
  }

  private async getFaenaId(faenaName: string): Promise<number | null> {
    if (!faenaName) return null;
    
    if (this.cacheFaena.has(faenaName)) {
      return this.cacheFaena.get(faenaName)!;
    }

    const faena = await this.prisma.faena.findFirst({
      where: {
        faena_name: {
          contains: faenaName
        }
      }
    });

    const id = faena?.id_faena || null;
    if (id) this.cacheFaena.set(faenaName, id);
    return id;
  }

  private async getProcessId(processName: string): Promise<number | null> {
    if (!processName) return null;
    
    if (this.cacheProcess.has(processName)) {
      return this.cacheProcess.get(processName)!;
    }

    const process = await this.prisma.proceso.findFirst({
      where: {
        proceso_name: {
          contains: processName
        }
      }
    });

    const id = process?.id_proceso || null;
    if (id) this.cacheProcess.set(processName, id);
    return id;
  }

  private async getOriginId(originName: string): Promise<number | null> {
    if (!originName) return null;
    
    if (this.cacheOrigin.has(originName)) {
      return this.cacheOrigin.get(originName)!;
    }

    // Intentar búsqueda exacta primero
    let origin = await this.prisma.origen.findFirst({
      where: { origen_name: originName }
    });

    // Si no encuentra exacta, buscar por contenido
    if (!origin) {
      origin = await this.prisma.origen.findFirst({
        where: {
          origen_name: {
            contains: originName
          }
        }
      });
    }

    const id = origin?.id_origen || null;
    if (id) this.cacheOrigin.set(originName, id);
    return id;
  }

  private async getInvestmentId(investmentName: string): Promise<number | null> {
    if (!investmentName) return null;
    
    if (this.cacheInvestment.has(investmentName)) {
      return this.cacheInvestment.get(investmentName)!;
    }

    const investment = await this.prisma.inversion.findFirst({
      where: {
        linea: {
          contains: investmentName
        }
      }
    });

    const id = investment?.id_inversion || null;
    if (id) this.cacheInvestment.set(investmentName, id);
    return id;
  }

  private async getTypeId(typeName: string): Promise<number | null> {
    if (!typeName) return null;
    
    if (this.cacheType.has(typeName)) {
      return this.cacheType.get(typeName)!;
    }

    const type = await this.prisma.tipo.findFirst({
      where: {
        tipo_name: {
          contains: typeName
        }
      }
    });

    const id = type?.id_tipo || null;
    if (id) this.cacheType.set(typeName, id);
    return id;
  }

  private async getScopeId(scopeName: string): Promise<number | null> {
    if (!scopeName) return null;
    
    if (this.cacheScope.has(scopeName)) {
      return this.cacheScope.get(scopeName)!;
    }

    const scope = await this.prisma.alcance.findFirst({
      where: {
        alcance_name: {
          contains: scopeName
        }
      }
    });

    const id = scope?.id_alcance || null;
    if (id) this.cacheScope.set(scopeName, id);
    return id;
  }

  private async getInteractionId(interactionName: string): Promise<number | null> {
    if (!interactionName) return null;
    
    if (this.cacheInteraction.has(interactionName)) {
      return this.cacheInteraction.get(interactionName)!;
    }

    const interaction = await this.prisma.interaccion.findFirst({
      where: {
        operacion: {
          contains: interactionName
        }
      }
    });

    const id = interaction?.id_interaccion || null;
    if (id) this.cacheInteraction.set(interactionName, id);
    return id;
  }

  private async getRiskId(riskName: string): Promise<number | null> {
    if (!riskName) return null;
    
    if (this.cacheRisk.has(riskName)) {
      return this.cacheRisk.get(riskName)!;
    }

    const risk = await this.prisma.riesgo.findFirst({
      where: {
        tipo_riesgo: {
          contains: riskName
        }
      }
    });

    const id = risk?.id_riesgo || null;
    if (id) this.cacheRisk.set(riskName, id);
    return id;
  }

  // Método para limpiar cache entre procesamiento de archivos
  private clearCache(): void {
    this.cacheValley.clear();
    this.cacheFaena.clear();
    this.cacheProcess.clear();
    this.cacheOrigin.clear();
    this.cacheInvestment.clear();
    this.cacheType.clear();
    this.cacheScope.clear();
    this.cacheInteraction.clear();
    this.cacheRisk.clear();
  }

  async processExcelFile(file: Express.Multer.File) {
    try {
      // Limpiar cache al inicio del procesamiento
      this.clearCache();
      
      // Subir archivo a Azure Blob Storage
      const blobInfo = await this.documentsService.uploadBlobOnly(file);
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      
      // Obtener el estado por defecto para cumplimiento (ID 1 = "No Iniciado")
      const defaultComplianceStatusId = 1;

      // Procesar hoja 'Tareas'
      const worksheetTareas = workbook.Sheets['Tareas'];
      let tareasResults = { success: 0, failed: 0, errors: [] as string[] };
      if (worksheetTareas) {
        const dataTareas = XLSX.utils.sheet_to_json(worksheetTareas);
        for (const row of dataTareas) {
          try {
            const appliesCompliance = (row['Cumplimiento']?.toString().toUpperCase() === 'SI');
            
            // Obtener IDs dinámicamente desde la base de datos
            const valleyId = await this.getValleyId(row['Valle']);
            const faenaId = await this.getFaenaId(row['Faena']);
            const processId = await this.getProcessId(row['Proceso']);
            
            const taskDto: CreateTaskDto = {
              name: row['Nombre'],
              description: row['Descripción'],
              valleyId: valleyId,
              faenaId: faenaId,
              processId: processId,
              statusId: 1,
              applies: appliesCompliance,
            };
            
            // Crear la tarea
            const createdTask = await this.tasksService.create(taskDto);
            
            // Si aplica cumplimiento, crear automáticamente el cumplimiento con estado "No Iniciado" (ID: 1)
            if (appliesCompliance && createdTask) {
              try {
                await this.complianceService.create({
                  taskId: createdTask.id,
                  statusId: defaultComplianceStatusId // Estado "No Iniciado"
                });
              } catch (complianceError) {
                // Log error pero no fallar la creación de la tarea
                tareasResults.errors.push(`Tarea creada pero falló crear cumplimiento para: ${row['Nombre']} - ${complianceError.message}`);
              }
            }
            
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
            // Obtener IDs dinámicamente desde la base de datos
            const originId = await this.getOriginId(row['Origen']);
            const investmentId = await this.getInvestmentId(row['Línea Inversión']);
            const typeId = await this.getTypeId(row['Tipo Iniciativa']);
            const scopeId = await this.getScopeId(row['Alcance']);
            const interactionId = await this.getInteractionId(row['Interacción']);
            const riskId = await this.getRiskId(row['Riesgo']);
            
            const infoDto = {
              taskId: task.id_tarea,
              originId: originId,
              investmentId: investmentId,
              typeId: typeId,
              scopeId: scopeId,
              interactionId: interactionId,
              riskId: riskId,
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