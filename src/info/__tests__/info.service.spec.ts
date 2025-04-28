import { Test, TestingModule } from '@nestjs/testing';
import { InfoService } from '../info.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOriginDto } from '../dto/update-origin.dto';
import { UpdateInvestmentDto } from '../dto/update-investment.dto';
import { UpdateTypeDto } from '../dto/update-type.dto';
import { UpdateScopeDto } from '../dto/update-scope.dto';
import { UpdateInteractionDto } from '../dto/update-interaction.dto';
import { UpdateRiskDto } from '../dto/update-risk.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InfoService', () => {
  let service: InfoService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      origen: {},
      inversion: {}
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<InfoService>(InfoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('Origen', () => {
    const mockOrigin = {
      id_origen: 1,
      origen_name: 'Test Origin',
      info_tareas: [
        {
          tarea: {
            id_tarea: '1',
            nombre: 'Test Task'
          }
        }
      ]
    };

    beforeEach(() => {
      mockPrismaService.origen = {
        findMany: jest.fn().mockResolvedValue([mockOrigin]),
        findUnique: jest.fn().mockResolvedValue(mockOrigin),
        update: jest.fn().mockResolvedValue(mockOrigin)
      };
    });

    it('debería retornar todos los orígenes', async () => {
      const result = await service.findAllOrigins();

      expect(result).toEqual([{
        id: 1,
        name: 'Test Origin',
        tasks: [{
          id: '1',
          name: 'Test Task'
        }]
      }]);

      expect(mockPrismaService.origen.findMany).toHaveBeenCalledWith({
        include: {
          info_tareas: {
            include: {
              tarea: true
            }
          }
        }
      });
    });

    it('debería retornar un origen por su ID', async () => {
      const result = await service.findOneOrigin(1);

      expect(result).toEqual({
        id: 1,
        name: 'Test Origin',
        tasks: [{
          id: '1',
          name: 'Test Task'
        }]
      });

      expect(mockPrismaService.origen.findUnique).toHaveBeenCalledWith({
        where: { id_origen: 1 },
        include: {
          info_tareas: {
            include: {
              tarea: true
            }
          }
        }
      });
    });

    it('debería lanzar NotFoundException cuando el origen no existe', async () => {
      mockPrismaService.origen.findUnique.mockResolvedValueOnce(null);

      const error = new NotFoundException('Origen no encontrado');
      await expect(service.findOneOrigin(999))
        .rejects
        .toThrow(error);
      
      expect(error.message).toBe('Origen no encontrado');
    });

    it('debería manejar correctamente campos vacíos', async () => {
      const updateOriginDto: UpdateOriginDto = {
        origen_name: ''
      };

      const error = new BadRequestException('El nombre del origen no puede estar vacío');
      mockPrismaService.origen.update.mockRejectedValueOnce(error);

      await expect(service.updateOrigin(1, updateOriginDto))
        .rejects
        .toThrow(error);
      
      expect(error.message).toBe('El nombre del origen no puede estar vacío');
    });

    it('debería manejar correctamente caracteres especiales', async () => {
      const updateOriginDto: UpdateOriginDto = {
        origen_name: 'Origen con áéíóú y ñ'
      };

      const result = await service.updateOrigin(1, updateOriginDto);
      expect(result).toEqual(mockOrigin);
    });
  });

  describe('Inversión', () => {
    const mockInvestment = {
      id_inversion: 1,
      linea: 'Test Line',
      info_tareas: [
        {
          tarea: {
            id_tarea: '1',
            nombre: 'Test Task'
          }
        }
      ]
    };

    beforeEach(() => {
      mockPrismaService.inversion = {
        findMany: jest.fn().mockResolvedValue([mockInvestment]),
        findUnique: jest.fn().mockResolvedValue(mockInvestment),
        update: jest.fn().mockResolvedValue(mockInvestment)
      };
    });

    it('debería retornar todas las inversiones', async () => {
      const result = await service.findAllInvestments();

      expect(result).toEqual([{
        id: 1,
        line: 'Test Line',
        tasks: [{
          id: '1',
          name: 'Test Task'
        }]
      }]);

      expect(mockPrismaService.inversion.findMany).toHaveBeenCalledWith({
        include: {
          info_tareas: {
            include: {
              tarea: true
            }
          }
        }
      });
    });

    it('debería retornar una inversión por su ID', async () => {
      const result = await service.findOneInvestment(1);

      expect(result).toEqual({
        id: 1,
        line: 'Test Line',
        tasks: [{
          id: '1',
          name: 'Test Task'
        }]
      });

      expect(mockPrismaService.inversion.findUnique).toHaveBeenCalledWith({
        where: { id_inversion: 1 },
        include: {
          info_tareas: {
            include: {
              tarea: true
            }
          }
        }
      });
    });

    it('debería lanzar NotFoundException cuando la inversión no existe', async () => {
      mockPrismaService.inversion.findUnique.mockResolvedValueOnce(null);

      const error = new NotFoundException('Inversión no encontrada');
      await expect(service.findOneInvestment(999))
        .rejects
        .toThrow(error);
      
      expect(error.message).toBe('Inversión no encontrada');
    });

    it('debería manejar correctamente campos con valores extremos', async () => {
      const updateInvestmentDto: UpdateInvestmentDto = {
        linea: 'a'.repeat(1000)
      };

      const error = new BadRequestException('La línea de inversión es demasiado larga');
      mockPrismaService.inversion.update.mockRejectedValueOnce(error);

      await expect(service.updateInvestment(1, updateInvestmentDto))
        .rejects
        .toThrow(error);
      
      expect(error.message).toBe('La línea de inversión es demasiado larga');
    });
  });
});
