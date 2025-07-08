import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';

@Injectable()
export class InfoService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(dto: CreateInfoDto | UpdateInfoDto) {
    return {
      id_tarea: dto.taskId,
      id_origen: dto.originId,
      id_inversion: dto.investmentId,
      id_tipo: dto.typeId,
      id_alcance: dto.scopeId,
      id_interaccion: dto.interactionId,
      id_riesgo: dto.riskId,
    };
  }

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
      task: info.tarea ? {
        id: info.tarea.id_tarea,
        name: info.tarea.nombre,
        description: info.tarea.descripcion,
        statusId: info.tarea.estado,
        applies: info.tarea.aplica,
        beneficiaryId: info.tarea.beneficiario,
        valleId: info.tarea.id_valle,
        beneficiary: info.tarea.beneficiario_rel ? {
          id: info.tarea.beneficiario_rel.id_beneficiario,
          legalName: info.tarea.beneficiario_rel.nombre_legal,
          rut: info.tarea.beneficiario_rel.rut,
          address: info.tarea.beneficiario_rel.direccion,
          entityType: info.tarea.beneficiario_rel.tipo_entidad,
          representative: info.tarea.beneficiario_rel.representante,
          hasLegalPersonality: info.tarea.beneficiario_rel.personalidad_juridica
        } : null,
        valle: info.tarea.valle ? {
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

  // Tablas asociadas
  async findAllOrigins() {
    const origins = await this.prisma.origen.findMany();
    return origins.map(origin => ({
      id: origin.id_origen,
      name: origin.origen_name
    }));
  }

  async findOneOrigin(id: number) {
    const origin = await this.prisma.origen.findUnique({
      where: { id_origen: id }
    });
    return origin ? {
      id: origin.id_origen,
      name: origin.origen_name
    } : null;
  }

  async findAllInvestments() {
    const investments = await this.prisma.inversion.findMany();
    return investments.map(investment => ({
      id: investment.id_inversion,
      line: investment.linea
    }));
  }

  async findOneInvestment(id: number) {
    const investment = await this.prisma.inversion.findUnique({
      where: { id_inversion: id }
    });
    return investment ? {
      id: investment.id_inversion,
      line: investment.linea
    } : null;
  }

  async findAllTypes() {
    const types = await this.prisma.tipo.findMany();
    return types.map(type => ({
      id: type.id_tipo,
      name: type.tipo_name
    }));
  }

  async findOneType(id: number) {
    const type = await this.prisma.tipo.findUnique({
      where: { id_tipo: id }
    });
    return type ? {
      id: type.id_tipo,
      name: type.tipo_name
    } : null;
  }

  async findAllScopes() {
    const scopes = await this.prisma.alcance.findMany();
    return scopes.map(scope => ({
      id: scope.id_alcance,
      name: scope.alcance_name
    }));
  }

  async findOneScope(id: number) {
    const scope = await this.prisma.alcance.findUnique({
      where: { id_alcance: id }
    });
    return scope ? {
      id: scope.id_alcance,
      name: scope.alcance_name
    } : null;
  }

  async findAllInteractions() {
    const interactions = await this.prisma.interaccion.findMany();
    return interactions.map(interaction => ({
      id: interaction.id_interaccion,
      operation: interaction.operacion
    }));
  }

  async findOneInteraction(id: number) {
    const interaction = await this.prisma.interaccion.findUnique({
      where: { id_interaccion: id }
    });
    return interaction ? {
      id: interaction.id_interaccion,
      operation: interaction.operacion
    } : null;
  }

  async findAllRisks() {
    const risks = await this.prisma.riesgo.findMany();
    return risks.map(risk => ({
      id: risk.id_riesgo,
      type: risk.tipo_riesgo
    }));
  }

  async findOneRisk(id: number) {
    const risk = await this.prisma.riesgo.findUnique({
      where: { id_riesgo: id }
    });
    return risk ? {
      id: risk.id_riesgo,
      type: risk.tipo_riesgo
    } : null;
  }

  // Métodos para obtener tareas por categoría
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

  async getInvestmentTasksCount(investmentId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_inversion: investmentId }
    });
    return count;
  }

  async getOriginTasksCount(originId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_origen: originId }
    });
    return count;
  }

  async getTypeTasksCount(typeId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_tipo: typeId }
    });
    return count;
  }

  async getScopeTasksCount(scopeId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_alcance: scopeId }
    });
    return count;
  }

  async getInteractionTasksCount(interactionId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_interaccion: interactionId }
    });
    return count;
  }

  async getRiskTasksCount(riskId: number) {
    const count = await this.prisma.info_tarea.count({
      where: { id_riesgo: riskId }
    });
    return count;
  }
} 