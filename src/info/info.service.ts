import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOriginDto } from './dto/update-origin.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';

@Injectable()
export class InfoService {
  constructor(private prisma: PrismaService) {}

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

  async updateOrigin(id: number, updateOriginDto: UpdateOriginDto) {
    return this.prisma.origen.update({
      where: { id_origen: id },
      data: { origen_name: updateOriginDto.origen_name }
    });
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

  async updateInvestment(id: number, updateInvestmentDto: UpdateInvestmentDto) {
    return this.prisma.inversion.update({
      where: { id_inversion: id },
      data: { linea: updateInvestmentDto.linea }
    });
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

  async updateType(id: number, updateTypeDto: UpdateTypeDto) {
    return this.prisma.tipo.update({
      where: { id_tipo: id },
      data: { tipo_name: updateTypeDto.tipo_name }
    });
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

  async updateScope(id: number, updateScopeDto: UpdateScopeDto) {
    return this.prisma.alcance.update({
      where: { id_alcance: id },
      data: { alcance_name: updateScopeDto.alcance_name }
    });
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

  async updateInteraction(id: number, updateInteractionDto: UpdateInteractionDto) {
    return this.prisma.interaccion.update({
      where: { id_interaccion: id },
      data: { operacion: updateInteractionDto.operacion }
    });
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

  async updateRisk(id: number, updateRiskDto: UpdateRiskDto) {
    return this.prisma.riesgo.update({
      where: { id_riesgo: id },
      data: { tipo_riesgo: updateRiskDto.tipo_riesgo }
    });
  }
} 