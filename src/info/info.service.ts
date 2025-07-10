import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';

/**
 * Servicio para la gestión completa de información complementaria y metadatos de tareas.
 * 
 * @description Proporciona funcionalidades para:
 * - CRUD de información clasificatoria asociada a tareas
 * - Gestión de 6 categorías: Origen, Inversión, Tipo, Alcance, Interacción y Riesgo
 * - Catálogos completos para cada categoría clasificatoria
 * - Filtros especializados para obtener tareas por categoría
 * - Contadores estadísticos de tareas por categoría
 * - Mapeo automático entre formatos de BD y GraphQL
 * - Validaciones de integridad referencial
 * - Consultas analíticas para dashboards y reportes
 * 
 * @class InfoService
 * @since 1.0.0
 */
@Injectable()
export class InfoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mapea datos de información desde formato DTO al formato de base de datos.
   * 
   * @param dto - DTO de creación o actualización de información
   * @returns Objeto con estructura de base de datos
   */
  private mapToDatabase(dto: CreateInfoDto | UpdateInfoDto) {
    return {
      id_tarea: dto.taskId,
      id_origen: dto.originId,
      id_inversion: dto.investmentId,
      id_tipo: dto.typeId,
      id_alcance: dto.scopeId,
      id_interaccion: dto.interactionId,
      id_riesgo: dto.riskId,
      cantidad: dto.quantity,
    };
  }

  /**
   * Mapea datos de información desde formato de base de datos al formato GraphQL.
   * 
   * @param info - Objeto de información de la base de datos
   * @returns Objeto con estructura GraphQL incluyendo tarea y todas las categorías relacionadas
   */
  private mapFromDatabase(info: any) {
    return {
      id: info.id_info_tarea,
      taskId: info.id_tarea,
      originId: info.id_origen,
      investmentId: info.id_inversion,
      typeId: info.id_tipo,
      scopeId: info.id_alcance,
      interactionId: info.id_interaccion,
      riskId: info.id_riesgo,
      quantity: info.cantidad,
      task: info.tarea ? {
        id: info.tarea.id_tarea,
        name: info.tarea.nombre,
        description: info.tarea.descripcion,
        statusId: info.tarea.estado,
        applies: info.tarea.aplica,
        beneficiaryId: info.tarea.beneficiario,
        valleyId: info.tarea.id_valle,
        beneficiary: info.tarea.beneficiario_rel ? {
          id: info.tarea.beneficiario_rel.id_beneficiario,
          legalName: info.tarea.beneficiario_rel.nombre_legal,
          rut: info.tarea.beneficiario_rel.rut,
          address: info.tarea.beneficiario_rel.direccion,
          entityType: info.tarea.beneficiario_rel.tipo_entidad,
          representative: info.tarea.beneficiario_rel.representante,
          hasLegalPersonality: info.tarea.beneficiario_rel.personalidad_juridica
        } : null,
        valley: info.tarea.valle ? {
          id: info.tarea.valle.id_valle,
          name: info.tarea.valle.valle_name
        } : null
      } : null,
      origin: info.origen ? {
        id: info.origen.id_origen,
        name: info.origen.origen_name
      } : null,
      investment: info.inversion ? {
        id: info.inversion.id_inversion,
        line: info.inversion.linea
      } : null,
      type: info.tipo ? {
        id: info.tipo.id_tipo,
        name: info.tipo.tipo_name
      } : null,
      scope: info.alcance ? {
        id: info.alcance.id_alcance,
        name: info.alcance.alcance_name
      } : null,
      interaction: info.interaccion ? {
        id: info.interaccion.id_interaccion,
        operation: info.interaccion.operacion
      } : null,
      risk: info.riesgo ? {
        id: info.riesgo.id_riesgo,
        type: info.riesgo.tipo_riesgo
      } : null
    };
  }

  /**
   * Crea un nuevo registro de información para una tarea.
   * 
   * @description Proceso de creación con validación de integridad:
   * 1. Verifica que la tarea no tenga ya información asociada
   * 2. Crea el registro con las categorías especificadas
   * 3. Incluye todas las relaciones en la respuesta
   * 
   * @param createInfoDto - Datos de información a crear
   * @returns Información creada con todas las relaciones incluidas
   * @throws Error si la tarea ya tiene información asociada
   */
  async create(createInfoDto: CreateInfoDto) {
    const existingInfo = await this.prisma.info_tarea.findFirst({
      where: { id_tarea: createInfoDto.taskId }
    });

    if (existingInfo) {
      throw new Error('Ya existe una información asociada a esta tarea');
    }

    const info = await this.prisma.info_tarea.create({
      data: this.mapToDatabase(createInfoDto),
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return this.mapFromDatabase(info);
  }

  /**
   * Recupera todos los registros de información del sistema.
   * 
   * @returns Lista completa de información con todas las categorías y relaciones
   */
  async findAll() {
    const infos = await this.prisma.info_tarea.findMany({
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return infos.map(info => this.mapFromDatabase(info));
  }

  /**
   * Busca un registro de información específico por su ID.
   * 
   * @param id - ID único del registro de información
   * @returns Información encontrada con todas las relaciones o null si no existe
   */
  async findOne(id: string) {
    const info = await this.prisma.info_tarea.findUnique({
      where: { id_info_tarea: id },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    if (!info) return null;
    return this.mapFromDatabase(info);
  }

  /**
   * Actualiza un registro de información existente.
   * 
   * @param id - ID del registro de información a actualizar
   * @param updateInfoDto - Nuevos datos de información
   * @returns Información actualizada con todas las relaciones
   */
  async update(id: string, updateInfoDto: UpdateInfoDto) {
    const info = await this.prisma.info_tarea.update({
      where: { id_info_tarea: id },
      data: this.mapToDatabase(updateInfoDto),
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return this.mapFromDatabase(info);
  }

  /**
   * Elimina un registro de información del sistema.
   * 
   * @param id - ID del registro de información a eliminar
   * @returns Información eliminada con sus datos previos
   */
  async remove(id: string) {
    const info = await this.prisma.info_tarea.delete({
      where: { id_info_tarea: id },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return this.mapFromDatabase(info);
  }

  /**
   * Obtiene la información asociada a una tarea específica.
   * 
   * @param id - ID de la tarea
   * @returns Información de la tarea con todas las categorías o null si no tiene información
   */
  async getTaskInfo(id: string) {
    const infoTask = await this.prisma.info_tarea.findFirst({
      where: { id_tarea: id },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    if (!infoTask) return null;
    return this.mapFromDatabase(infoTask);
  }

  // Tablas asociadas - Catálogos
  /**
   * Recupera todos los orígenes disponibles en el sistema.
   * 
   * @returns Lista de orígenes con ID y nombre
   */
  async findAllOrigins() {
    const origins = await this.prisma.origen.findMany();
    return origins.map(origin => ({
      id: origin.id_origen,
      name: origin.origen_name
    }));
  }

  /**
   * Busca un origen específico por su ID.
   * 
   * @param id - ID del origen
   * @returns Origen encontrado o null si no existe
   */
  async findOneOrigin(id: number) {
    const origin = await this.prisma.origen.findUnique({
      where: { id_origen: id }
    });
    return origin ? {
      id: origin.id_origen,
      name: origin.origen_name
    } : null;
  }

  /**
   * Recupera todas las líneas de inversión disponibles.
   * 
   * @returns Lista de inversiones con ID y línea
   */
  async findAllInvestments() {
    const investments = await this.prisma.inversion.findMany();
    return investments.map(investment => ({
      id: investment.id_inversion,
      line: investment.linea
    }));
  }

  /**
   * Busca una línea de inversión específica por su ID.
   * 
   * @param id - ID de la inversión
   * @returns Inversión encontrada o null si no existe
   */
  async findOneInvestment(id: number) {
    const investment = await this.prisma.inversion.findUnique({
      where: { id_inversion: id }
    });
    return investment ? {
      id: investment.id_inversion,
      line: investment.linea
    } : null;
  }

  /**
   * Recupera todos los tipos de tarea disponibles.
   * 
   * @returns Lista de tipos con ID y nombre
   */
  async findAllTypes() {
    const types = await this.prisma.tipo.findMany();
    return types.map(type => ({
      id: type.id_tipo,
      name: type.tipo_name
    }));
  }

  /**
   * Busca un tipo de tarea específico por su ID.
   * 
   * @param id - ID del tipo
   * @returns Tipo encontrado o null si no existe
   */
  async findOneType(id: number) {
    const type = await this.prisma.tipo.findUnique({
      where: { id_tipo: id }
    });
    return type ? {
      id: type.id_tipo,
      name: type.tipo_name
    } : null;
  }

  /**
   * Recupera todos los alcances de ejecución disponibles.
   * 
   * @returns Lista de alcances con ID y nombre
   */
  async findAllScopes() {
    const scopes = await this.prisma.alcance.findMany();
    return scopes.map(scope => ({
      id: scope.id_alcance,
      name: scope.alcance_name
    }));
  }

  /**
   * Busca un alcance específico por su ID.
   * 
   * @param id - ID del alcance
   * @returns Alcance encontrado o null si no existe
   */
  async findOneScope(id: number) {
    const scope = await this.prisma.alcance.findUnique({
      where: { id_alcance: id }
    });
    return scope ? {
      id: scope.id_alcance,
      name: scope.alcance_name
    } : null;
  }

  /**
   * Recupera todos los tipos de interacción/operación disponibles.
   * 
   * @returns Lista de interacciones con ID y operación
   */
  async findAllInteractions() {
    const interactions = await this.prisma.interaccion.findMany();
    return interactions.map(interaction => ({
      id: interaction.id_interaccion,
      operation: interaction.operacion
    }));
  }

  /**
   * Busca un tipo de interacción específico por su ID.
   * 
   * @param id - ID de la interacción
   * @returns Interacción encontrada o null si no existe
   */
  async findOneInteraction(id: number) {
    const interaction = await this.prisma.interaccion.findUnique({
      where: { id_interaccion: id }
    });
    return interaction ? {
      id: interaction.id_interaccion,
      operation: interaction.operacion
    } : null;
  }

  /**
   * Recupera todos los tipos de riesgo disponibles.
   * 
   * @returns Lista de riesgos con ID y tipo
   */
  async findAllRisks() {
    const risks = await this.prisma.riesgo.findMany();
    return risks.map(risk => ({
      id: risk.id_riesgo,
      type: risk.tipo_riesgo
    }));
  }

  /**
   * Busca un tipo de riesgo específico por su ID.
   * 
   * @param id - ID del riesgo
   * @returns Riesgo encontrado o null si no existe
   */
  async findOneRisk(id: number) {
    const risk = await this.prisma.riesgo.findUnique({
      where: { id_riesgo: id }
    });
    return risk ? {
      id: risk.id_riesgo,
      type: risk.tipo_riesgo
    } : null;
  }

  // Métodos para obtener tareas por categoría - Filtros
  /**
   * Filtra tareas por origen específico.
   * 
   * @param originId - ID del origen
   * @returns Lista de información de tareas del origen especificado
   */
  async getTasksByOrigin(originId: number) {
    const infos = await this.prisma.info_tarea.findMany({
      where: { id_origen: originId },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return infos.map(info => this.mapFromDatabase(info));
  }

  /**
   * Filtra tareas por línea de inversión específica.
   * 
   * @param investmentId - ID de la línea de inversión
   * @returns Lista de información de tareas de la inversión especificada
   */
  async getTasksByInvestment(investmentId: number) {
    const infos = await this.prisma.info_tarea.findMany({
      where: { id_inversion: investmentId },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return infos.map(info => this.mapFromDatabase(info));
  }

  /**
   * Filtra tareas por tipo específico.
   * 
   * @param typeId - ID del tipo de tarea
   * @returns Lista de información de tareas del tipo especificado
   */
  async getTasksByType(typeId: number) {
    const infos = await this.prisma.info_tarea.findMany({
      where: { id_tipo: typeId },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return infos.map(info => this.mapFromDatabase(info));
  }

  /**
   * Filtra tareas por alcance específico.
   * 
   * @param scopeId - ID del alcance
   * @returns Lista de información de tareas del alcance especificado
   */
  async getTasksByScope(scopeId: number) {
    const infos = await this.prisma.info_tarea.findMany({
      where: { id_alcance: scopeId },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return infos.map(info => this.mapFromDatabase(info));
  }

  /**
   * Filtra tareas por tipo de interacción específico.
   * 
   * @param interactionId - ID del tipo de interacción
   * @returns Lista de información de tareas de la interacción especificada
   */
  async getTasksByInteraction(interactionId: number) {
    const infos = await this.prisma.info_tarea.findMany({
      where: { id_interaccion: interactionId },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return infos.map(info => this.mapFromDatabase(info));
  }

  /**
   * Filtra tareas por tipo de riesgo específico.
   * 
   * @param riskId - ID del tipo de riesgo
   * @returns Lista de información de tareas del riesgo especificado
   */
  async getTasksByRisk(riskId: number) {
    const infos = await this.prisma.info_tarea.findMany({
      where: { id_riesgo: riskId },
      include: {
        tarea: {
          include: {
            beneficiario_rel: true,
            valle: true
          }
        },
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true
      }
    });

    return infos.map(info => this.mapFromDatabase(info));
  }

  // Métodos contadores por categoría - Estadísticas
  /**
   * Cuenta las tareas asociadas a una línea de inversión específica.
   * 
   * @param investmentId - ID de la línea de inversión
   * @returns Número total de tareas en la inversión
   */
  async getInvestmentTasksCount(investmentId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_inversion: investmentId }
    });
    return count;
  }

  /**
   * Cuenta las tareas asociadas a un origen específico.
   * 
   * @param originId - ID del origen
   * @returns Número total de tareas del origen
   */
  async getOriginTasksCount(originId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_origen: originId }
    });
    return count;
  }

  /**
   * Cuenta las tareas asociadas a un tipo específico.
   * 
   * @param typeId - ID del tipo de tarea
   * @returns Número total de tareas del tipo
   */
  async getTypeTasksCount(typeId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_tipo: typeId }
    });
    return count;
  }

  /**
   * Cuenta las tareas asociadas a un alcance específico.
   * 
   * @param scopeId - ID del alcance
   * @returns Número total de tareas del alcance
   */
  async getScopeTasksCount(scopeId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_alcance: scopeId }
    });
    return count;
  }

  /**
   * Cuenta las tareas asociadas a un tipo de interacción específico.
   * 
   * @param interactionId - ID del tipo de interacción
   * @returns Número total de tareas de la interacción
   */
  async getInteractionTasksCount(interactionId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_interaccion: interactionId }
    });
    return count;
  }

  /**
   * Cuenta las tareas asociadas a un tipo de riesgo específico.
   * 
   * @param riskId - ID del tipo de riesgo
   * @returns Número total de tareas del riesgo
   */
  async getRiskTasksCount(riskId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_riesgo: riskId }
    });
    return count;
  }
} 