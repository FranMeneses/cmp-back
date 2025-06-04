import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';
import { CreateRegistryDto } from './dto/create-registry.dto';
import { UpdateRegistryDto } from './dto/update-registry.dto';
import { CreateSolpedDto } from './dto/create-solped.dto';
import { UpdateSolpedDto } from './dto/update-solped.dto';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  // Compliance methods
  private mapToDatabase(dto: CreateComplianceDto | UpdateComplianceDto) {
    return {
      id_tarea: dto.taskId,
      id_cump_est: dto.statusId,
      aplica: dto.applies
    };
  }

  private mapFromDatabase(compliance: any) {
    return {
      id: compliance.id_cumplimiento,
      taskId: compliance.id_tarea,
      statusId: compliance.id_cump_est,
      applies: compliance.aplica,
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
      } : null,
      registries: compliance.registro?.map(registry => this.mapRegistryFromDatabase(registry)) || []
    };
  }

  // Registry methods
  private mapRegistryToDatabase(dto: CreateRegistryDto | UpdateRegistryDto) {
    return {
      id_cumplimiento: dto.complianceId,
      hes: dto.hes,
      hem: dto.hem,
      proveedor: dto.provider,
      fecha_inicio: dto.startDate,
      fecha_termino: dto.endDate
    };
  }

  private mapRegistryFromDatabase(registry: any) {
    return {
      id: registry.id_registro,
      complianceId: registry.id_cumplimiento,
      hes: registry.hes,
      hem: registry.hem,
      provider: registry.proveedor,
      startDate: registry.fecha_inicio,
      endDate: registry.fecha_termino,
      memos: registry.memo?.map(memo => ({
        id: memo.id_memo,
        value: memo.valor
      })) || [],
      solpeds: registry.solped?.map(solped => ({
        id: solped.id_solped,
        ceco: solped.ceco,
        account: solped.cuenta,
        value: solped.valor
      })) || []
    };
  }

  // Solped methods
  private mapSolpedToDatabase(dto: CreateSolpedDto | UpdateSolpedDto) {
    return {
      id_registro: dto.registryId,
      ceco: dto.ceco,
      cuenta: dto.account,
      valor: dto.value
    };
  }

  private mapSolpedFromDatabase(solped: any) {
    return {
      id: solped.id_solped,
      registryId: solped.id_registro,
      ceco: solped.ceco,
      account: solped.cuenta,
      value: solped.valor
    };
  }

  // Memo methods
  private mapMemoToDatabase(dto: CreateMemoDto | UpdateMemoDto) {
    return {
      id_registro: dto.registryId,
      valor: dto.value
    };
  }

  private mapMemoFromDatabase(memo: any) {
    return {
      id: memo.id_memo,
      registryId: memo.id_registro,
      value: memo.valor
    };
  }

  // Compliance CRUD
  async create(createComplianceDto: CreateComplianceDto) {
    const existingCompliance = await this.prisma.cumplimiento.findFirst({
      where: { id_tarea: createComplianceDto.taskId }
    });

    if (existingCompliance) {
      throw new Error('Ya existe un cumplimiento asociado a esta tarea');
    }

    const compliance = await this.prisma.cumplimiento.create({
      data: this.mapToDatabase(createComplianceDto),
      include: {
        tarea: true,
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });

    return this.mapFromDatabase(compliance);
  }

  async findAll() {
    const compliances = await this.prisma.cumplimiento.findMany({
      include: {
        tarea: true,
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });

    return compliances.map(compliance => this.mapFromDatabase(compliance));
  }

  async findOne(id: string) {
    const compliance = await this.prisma.cumplimiento.findUnique({
      where: { id_cumplimiento: id },
      include: {
        tarea: true,
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });

    if (!compliance) return null;
    return this.mapFromDatabase(compliance);
  }

  async update(id: string, updateComplianceDto: UpdateComplianceDto) {
    const compliance = await this.prisma.cumplimiento.update({
      where: { id_cumplimiento: id },
      data: this.mapToDatabase(updateComplianceDto),
      include: {
        tarea: true,
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });

    return this.mapFromDatabase(compliance);
  }

  async remove(id: string) {
    const compliance = await this.prisma.cumplimiento.delete({
      where: { id_cumplimiento: id },
      include: {
        tarea: true,
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });

    return this.mapFromDatabase(compliance);
  }

  async getTaskCompliance(id: string) {
    const compliance = await this.prisma.cumplimiento.findFirst({
      where: { id_tarea: id },
      include: {
        tarea: true,
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });

    if (!compliance) return null;
    return this.mapFromDatabase(compliance);
  }

  async getAllComplianceStatuses() {
    const statuses = await this.prisma.cumplimiento_estado.findMany();
    return statuses.map(status => ({
      id: status.id_cumplimiento_estado,
      name: status.estado,
      days: status.dias
    }));
  }

  // Registry CRUD
  async createRegistry(createRegistryDto: CreateRegistryDto) {
    const registry = await this.prisma.registro.create({
      data: this.mapRegistryToDatabase(createRegistryDto),
      include: {
        memo: true,
        solped: true
      }
    });

    return this.mapRegistryFromDatabase(registry);
  }

  async findAllRegistries() {
    const registries = await this.prisma.registro.findMany({
      include: {
        memo: true,
        solped: true
      }
    });

    return registries.map(registry => this.mapRegistryFromDatabase(registry));
  }

  async findOneRegistry(id: string) {
    const registry = await this.prisma.registro.findUnique({
      where: { id_registro: id },
      include: {
        memo: true,
        solped: true
      }
    });

    if (!registry) return null;
    return this.mapRegistryFromDatabase(registry);
  }

  async updateRegistry(id: string, updateRegistryDto: UpdateRegistryDto) {
    const registry = await this.prisma.registro.update({
      where: { id_registro: id },
      data: this.mapRegistryToDatabase(updateRegistryDto),
      include: {
        memo: true,
        solped: true
      }
    });

    return this.mapRegistryFromDatabase(registry);
  }

  async removeRegistry(id: string) {
    const registry = await this.prisma.registro.delete({
      where: { id_registro: id },
      include: {
        memo: true,
        solped: true
      }
    });

    return this.mapRegistryFromDatabase(registry);
  }

  async getComplianceRegistries(complianceId: string) {
    const registries = await this.prisma.registro.findMany({
      where: { id_cumplimiento: complianceId },
      include: {
        memo: true,
        solped: true
      }
    });

    return registries.map(registry => this.mapRegistryFromDatabase(registry));
  }

  // Solped CRUD
  async createSolped(createSolpedDto: CreateSolpedDto) {
    // Check if registry exists
    const registry = await this.prisma.registro.findUnique({
      where: { id_registro: createSolpedDto.registryId },
      include: {
        memo: true,
        solped: true
      }
    });

    if (!registry) {
      throw new BadRequestException('El registro no existe');
    }

    // Check if registry already has a memo
    if (registry.memo.length > 0) {
      throw new BadRequestException('El registro ya tiene un memo asociado');
    }

    // Check if registry already has a solped
    if (registry.solped.length > 0) {
      throw new BadRequestException('El registro ya tiene una solped asociada');
    }

    const solped = await this.prisma.solped.create({
      data: this.mapSolpedToDatabase(createSolpedDto)
    });

    return this.mapSolpedFromDatabase(solped);
  }

  async findAllSolpeds() {
    const solpeds = await this.prisma.solped.findMany();
    return solpeds.map(solped => this.mapSolpedFromDatabase(solped));
  }

  async findOneSolped(id: string) {
    const solped = await this.prisma.solped.findUnique({
      where: { id_solped: id }
    });

    if (!solped) return null;
    return this.mapSolpedFromDatabase(solped);
  }

  async updateSolped(id: string, updateSolpedDto: UpdateSolpedDto) {
    const solped = await this.prisma.solped.update({
      where: { id_solped: id },
      data: this.mapSolpedToDatabase(updateSolpedDto)
    });

    return this.mapSolpedFromDatabase(solped);
  }

  async removeSolped(id: string) {
    const solped = await this.prisma.solped.delete({
      where: { id_solped: id }
    });

    return this.mapSolpedFromDatabase(solped);
  }

  async getRegistrySolped(registryId: string) {
    const solped = await this.prisma.solped.findFirst({
      where: { id_registro: registryId }
    });

    if (!solped) return null;
    return this.mapSolpedFromDatabase(solped);
  }

  // Memo CRUD
  async createMemo(createMemoDto: CreateMemoDto) {
    // Check if registry exists
    const registry = await this.prisma.registro.findUnique({
      where: { id_registro: createMemoDto.registryId },
      include: {
        memo: true,
        solped: true
      }
    });

    if (!registry) {
      throw new BadRequestException('El registro no existe');
    }

    // Check if registry already has a memo
    if (registry.memo.length > 0) {
      throw new BadRequestException('El registro ya tiene un memo asociado');
    }

    // Check if registry already has a solped
    if (registry.solped.length > 0) {
      throw new BadRequestException('El registro ya tiene una solped asociada');
    }

    const memo = await this.prisma.memo.create({
      data: this.mapMemoToDatabase(createMemoDto)
    });

    return this.mapMemoFromDatabase(memo);
  }

  async findAllMemos() {
    const memos = await this.prisma.memo.findMany();
    return memos.map(memo => this.mapMemoFromDatabase(memo));
  }

  async findOneMemo(id: string) {
    const memo = await this.prisma.memo.findUnique({
      where: { id_memo: id }
    });

    if (!memo) return null;
    return this.mapMemoFromDatabase(memo);
  }

  async updateMemo(id: string, updateMemoDto: UpdateMemoDto) {
    const memo = await this.prisma.memo.update({
      where: { id_memo: id },
      data: this.mapMemoToDatabase(updateMemoDto)
    });

    return this.mapMemoFromDatabase(memo);
  }

  async removeMemo(id: string) {
    const memo = await this.prisma.memo.delete({
      where: { id_memo: id }
    });

    return this.mapMemoFromDatabase(memo);
  }

  async getRegistryMemo(registryId: string) {
    const memo = await this.prisma.memo.findFirst({
      where: { id_registro: registryId }
    });

    if (!memo) return null;
    return this.mapMemoFromDatabase(memo);
  }

  async getAppliedCompliances() {
    const compliances = await this.prisma.cumplimiento.findMany({
      where: {
        aplica: true
      },
      include: {
        tarea: true,
        cumplimiento_estado: true,
        registro: {
          include: {
            memo: true,
            solped: true
          }
        }
      }
    });

    return compliances.map(compliance => this.mapFromDatabase(compliance));
  }
} 