import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';

/**
 * Servicio para la gestión completa de cumplimiento normativo y regulatorio.
 * 
 * @description Maneja el ciclo completo de cumplimiento de requisitos para tareas:
 * - CRUD con validaciones de integridad (una tarea = un cumplimiento)
 * - Gestión de estados con flujo secuencial automatizado
 * - Integración con sistemas SAP (SOLPED/MEMO, HES/HEM)
 * - Control financiero y contable (valores, centros de costo, cuentas)
 * - Auto-avance de estados basado en flag "listo"
 * - Filtros especializados por estado y actividad
 * - Mapeo automático entre formatos de BD y GraphQL
 * - Validaciones de aplicabilidad de cumplimiento por tarea
 * 
 * @class ComplianceService
 * @since 1.0.0
 */
@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  // Mapping methods
  /**
   * Mapea datos de cumplimiento desde formato DTO al formato de base de datos.
   * 
   * @param dto - DTO de creación o actualización de cumplimiento
   * @returns Objeto con estructura de base de datos
   */
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

    if ('listo' in dto && dto.listo !== undefined) {
      mappedData.listo = dto.listo;
    }
    
    return mappedData;
  }

  /**
   * Mapea datos de cumplimiento desde formato de base de datos al formato GraphQL.
   * 
   * @param compliance - Objeto de cumplimiento de la base de datos
   * @returns Objeto con estructura GraphQL incluyendo tarea y estado relacionados
   */
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
      listo: compliance.listo,
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
  /**
   * Crea un nuevo registro de cumplimiento para una tarea.
   * 
   * @description Proceso de creación con validaciones:
   * 1. Verifica que no exista ya un cumplimiento para la tarea
   * 2. Valida que la tarea exista en el sistema
   * 3. Confirma que la tarea aplique para cumplimiento
   * 4. Crea el registro con estado inicial
   * 
   * @param createComplianceDto - Datos del cumplimiento a crear
   * @returns Cumplimiento creado con relaciones incluidas
   * @throws BadRequestException si la tarea ya tiene cumplimiento, no existe, o no aplica
   */
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

  /**
   * Recupera todos los registros de cumplimiento del sistema.
   * 
   * @returns Lista completa de cumplimientos ordenados por fecha de actualización (desc)
   */
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

  /**
   * Busca un registro de cumplimiento específico por su ID.
   * 
   * @param id - ID único del cumplimiento
   * @returns Cumplimiento encontrado con sus relaciones o null si no existe
   */
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

  /**
   * Actualiza un registro de cumplimiento existente.
   * 
   * @description Incluye lógica especial de auto-avance:
   * - Si 'listo' = true, automáticamente avanza al estado "Completado" (ID: 7)
   * - Actualiza campos financieros y de integración SAP
   * - Maneja errores de auto-completado de forma graceful
   * 
   * @param id - ID del cumplimiento a actualizar
   * @param updateComplianceDto - Nuevos datos del cumplimiento
   * @returns Cumplimiento actualizado con estado final
   * @throws BadRequestException si el cumplimiento no existe
   */
  async update(id: string, updateComplianceDto: UpdateComplianceDto) {
    // Verificar que el cumplimiento existe
    const existingCompliance = await this.prisma.cumplimiento.findUnique({
      where: { id_cumplimiento: id },
      include: {
        cumplimiento_estado: true
      }
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

    // Si se envió el flag listo = true, cambiar automáticamente a estado "Completado" (ID: 7)
    if (updateComplianceDto.listo === true) {
      try {
        // Avanzar automáticamente al estado "Completado" (ID: 7)
        const completedCompliance = await this.prisma.cumplimiento.update({
          where: { id_cumplimiento: id },
          data: { id_cump_est: 7 }, // Estado "Completado"
          include: {
            tarea: true,
            cumplimiento_estado: true
          }
        });

        return this.mapFromDatabase(completedCompliance);
      } catch (error) {
        console.error('Error auto-completing compliance:', error);
        // Si falla el auto-completado, devolver el compliance actualizado sin auto-completar
      }
    }

    return this.mapFromDatabase(compliance);
  }

  /**
   * Elimina un registro de cumplimiento del sistema.
   * 
   * @param id - ID del cumplimiento a eliminar
   * @returns Mensaje de confirmación de eliminación
   * @throws BadRequestException si el cumplimiento no existe
   */
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
  /**
   * Obtiene el registro de cumplimiento asociado a una tarea específica.
   * 
   * @param taskId - ID de la tarea
   * @returns Cumplimiento de la tarea o null si no tiene cumplimiento
   */
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
  /**
   * Recupera todos los estados de cumplimiento disponibles en el sistema.
   * 
   * @returns Lista de estados ordenados por ID con información de días asociados
   */
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
  /**
   * Avanza el estado de cumplimiento al siguiente nivel secuencial.
   * 
   * @description Incrementa el ID del estado actual en 1 y valida que exista
   * el estado destino antes de realizar el cambio.
   * 
   * @param id - ID del cumplimiento a avanzar
   * @returns Cumplimiento con el nuevo estado
   * @throws BadRequestException si el cumplimiento no existe o no hay estado siguiente
   */
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
  /**
   * Filtra cumplimientos por un estado específico.
   * 
   * @param statusId - ID del estado de cumplimiento
   * @returns Lista de cumplimientos en el estado especificado
   */
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
  /**
   * Recupera todos los cumplimientos que no están en estado "Completado".
   * 
   * @description Filtra automáticamente los cumplimientos que no han sido
   * finalizados, útil para dashboards y seguimiento activo.
   * 
   * @returns Lista de cumplimientos activos ordenados por fecha de actualización
   */
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