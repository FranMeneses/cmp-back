import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';

@Injectable()
export class InfoService {
  constructor(private prisma: PrismaService) {}

  // Info Task CRUD
  async create(createInfoDto: CreateInfoDto) {
    // Verificar si ya existe una info_tarea para esta tarea
    const existingInfo = await this.prisma.info_tarea.findFirst({
      where: { id_tarea: createInfoDto.taskId }
    });

    if (existingInfo) {
      throw new Error('Ya existe una información asociada a esta tarea');
    }

    const info = await this.prisma.info_tarea.create({
      data: {
        id_tarea: createInfoDto.taskId,
        id_origen: createInfoDto.originId,
        id_inversion: createInfoDto.investmentId,
        id_tipo: createInfoDto.typeId,
        id_alcance: createInfoDto.scopeId,
        id_interaccion: createInfoDto.interactionId,
        id_riesgo: createInfoDto.riskId,
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
      riskId: info.id_riesgo
    };
  }

  async findAll() {
    const infos = await this.prisma.info_tarea.findMany({
      include: {
        tarea: {
          select: {
            id_tarea: true,
            nombre: true,
            descripcion: true
          }
        }
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
        description: info.tarea.descripcion
      } : null
    }));
  }

  async findOne(id: string) {
    const info = await this.prisma.info_tarea.findUnique({
      where: { id_info_tarea: id },
      include: {
        tarea: {
          select: {
            id_tarea: true,
            nombre: true,
            descripcion: true
          }
        }
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
        description: info.tarea.descripcion
      } : null
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
      riskId: info.id_riesgo
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
      riskId: info.id_riesgo
    };
  }

  async getTaskInfo(id: string) {
    const infoTask = await this.prisma.info_tarea.findFirst({
      where: { id_tarea: id },
      include: {
        tarea: {
          select: {
            id_tarea: true,
            nombre: true,
            descripcion: true
          }
        }
      }
    });

    if (!infoTask) {
      return null;
    }

    return {
      id: infoTask.id_info_tarea,
      taskId: infoTask.id_tarea,
      originId: infoTask.id_origen,
      investmentId: infoTask.id_inversion,
      typeId: infoTask.id_tipo,
      scopeId: infoTask.id_alcance,
      interactionId: infoTask.id_interaccion,
      riskId: infoTask.id_riesgo,
      task: infoTask.tarea ? {
        id: infoTask.tarea.id_tarea,
        name: infoTask.tarea.nombre,
        description: infoTask.tarea.descripcion
      } : null
    };
  }

  //Tablas asociadas
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

  //getInvestmentTasksCount(investmentId: number)
  //getValleyInvestmentTasksCount(valleyId: number, investmentId: number)
} 