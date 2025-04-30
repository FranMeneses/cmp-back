import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';

@Injectable()
export class InfoService {
  constructor(private prisma: PrismaService) {}

  // Info Task CRUD
  async create(createInfoDto: CreateInfoDto) {
    const info = await this.prisma.info_tarea.create({
      data: {
        id_tarea: createInfoDto.taskId,
        id_origen: createInfoDto.originId,
        id_inversion: createInfoDto.investmentId,
        id_tipo: createInfoDto.typeId,
        id_alcance: createInfoDto.scopeId,
        id_interaccion: createInfoDto.interactionId,
        id_riesgo: createInfoDto.riskId,
      },
      include: {
        tarea: true,
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true,
      }
    });

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
      } : null,
    };
  }

  async findAll() {
    const infos = await this.prisma.info_tarea.findMany({
      include: {
        tarea: true,
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true,
      }
    });

    return infos.map(info => ({
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
      } : null,
    }));
  }

  async findOne(id: string) {
    const info = await this.prisma.info_tarea.findUnique({
      where: { id_info_tarea: id },
      include: {
        tarea: true,
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true,
      }
    });

    if (!info) return null;

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
      } : null,
    };
  }

  async update(id: string, updateInfoDto: UpdateInfoDto) {
    const info = await this.prisma.info_tarea.update({
      where: { id_info_tarea: id },
      data: {
        id_tarea: updateInfoDto.taskId,
        id_origen: updateInfoDto.originId,
        id_inversion: updateInfoDto.investmentId,
        id_tipo: updateInfoDto.typeId,
        id_alcance: updateInfoDto.scopeId,
        id_interaccion: updateInfoDto.interactionId,
        id_riesgo: updateInfoDto.riskId,
      },
      include: {
        tarea: true,
        origen: true,
        inversion: true,
        tipo: true,
        alcance: true,
        interaccion: true,
        riesgo: true,
      }
    });

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
      } : null,
    };
  }

  async remove(id: string) {
    const info = await this.prisma.info_tarea.delete({
      where: { id_info_tarea: id }
    });

    return {
      id: info.id_info_tarea,
      taskId: info.id_tarea,
      originId: info.id_origen,
      investmentId: info.id_inversion,
      typeId: info.id_tipo,
      scopeId: info.id_alcance,
      interactionId: info.id_interaccion,
      riskId: info.id_riesgo,
    };
  }

  // Origen
  async findAllOrigins() {
    const origins = await this.prisma.origen.findMany({
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return origins.map(origin => ({
      id: origin.id_origen,
      name: origin.origen_name,
      tasks: origin.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    }));
  }

  async findOneOrigin(id: number) {
    const origin = await this.prisma.origen.findUnique({
      where: { id_origen: id },
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return origin ? {
      id: origin.id_origen,
      name: origin.origen_name,
      tasks: origin.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    } : null;
  }

  // Inversión
  async findAllInvestments() {
    const investments = await this.prisma.inversion.findMany({
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return investments.map(investment => ({
      id: investment.id_inversion,
      line: investment.linea,
      tasks: investment.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    }));
  }

  async findOneInvestment(id: number) {
    const investment = await this.prisma.inversion.findUnique({
      where: { id_inversion: id },
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return investment ? {
      id: investment.id_inversion,
      line: investment.linea,
      tasks: investment.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    } : null;
  }

  // Tipo
  async findAllTypes() {
    const types = await this.prisma.tipo.findMany({
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return types.map(type => ({
      id: type.id_tipo,
      name: type.tipo_name,
      tasks: type.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    }));
  }

  async findOneType(id: number) {
    const type = await this.prisma.tipo.findUnique({
      where: { id_tipo: id },
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return type ? {
      id: type.id_tipo,
      name: type.tipo_name,
      tasks: type.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    } : null;
  }

  // Alcance
  async findAllScopes() {
    const scopes = await this.prisma.alcance.findMany({
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return scopes.map(scope => ({
      id: scope.id_alcance,
      name: scope.alcance_name,
      tasks: scope.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    }));
  }

  async findOneScope(id: number) {
    const scope = await this.prisma.alcance.findUnique({
      where: { id_alcance: id },
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return scope ? {
      id: scope.id_alcance,
      name: scope.alcance_name,
      tasks: scope.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    } : null;
  }

  // Interacción
  async findAllInteractions() {
    const interactions = await this.prisma.interaccion.findMany({
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return interactions.map(interaction => ({
      id: interaction.id_interaccion,
      operation: interaction.operacion,
      tasks: interaction.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    }));
  }

  async findOneInteraction(id: number) {
    const interaction = await this.prisma.interaccion.findUnique({
      where: { id_interaccion: id },
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return interaction ? {
      id: interaction.id_interaccion,
      operation: interaction.operacion,
      tasks: interaction.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    } : null;
  }

  // Riesgo
  async findAllRisks() {
    const risks = await this.prisma.riesgo.findMany({
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return risks.map(risk => ({
      id: risk.id_riesgo,
      type: risk.tipo_riesgo,
      tasks: risk.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    }));
  }

  async findOneRisk(id: number) {
    const risk = await this.prisma.riesgo.findUnique({
      where: { id_riesgo: id },
      include: {
        info_tareas: {
          include: {
            tarea: true
          }
        }
      }
    });
    return risk ? {
      id: risk.id_riesgo,
      type: risk.tipo_riesgo,
      tasks: risk.info_tareas.map(info => ({
        id: info.tarea.id_tarea,
        name: info.tarea.nombre
      }))
    } : null;
  }
} 