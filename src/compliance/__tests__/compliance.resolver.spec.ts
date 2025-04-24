import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceResolver } from '../compliance.resolver';
import { ComplianceService } from '../compliance.service';
import { Compliance } from '../../graphql/graphql.types';
import { CreateComplianceDto } from '../dto/create-compliance.dto';
import { UpdateComplianceDto } from '../dto/update-compliance.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

describe('ComplianceResolver', () => {
  let resolver: ComplianceResolver;
  let service: ComplianceService;

  const mockCompliance: Compliance = {
    id: '1',
    subtaskId: '1',
    statusId: 1,
    applies: true,
  };

  const mockCompliance2: Compliance = {
    id: '2',
    subtaskId: '2',
    statusId: 2,
    applies: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceResolver,
        {
          provide: ComplianceService,
          useValue: {
            findAll: jest.fn().mockImplementation((query) => {
              if (!query || Object.keys(query).length === 0) {
                return [mockCompliance, mockCompliance2];
              }
              if (query.subtaskId === '1') {
                return [mockCompliance];
              }
              if (query.statusId === 1) {
                return [mockCompliance];
              }
              if (query.applies === true) {
                return [mockCompliance];
              }
              return [];
            }),
            findOne: jest.fn().mockImplementation((id) => {
              if (id === '1') return mockCompliance;
              if (id === '2') return mockCompliance2;
              throw new NotFoundException(`Cumplimiento con ID ${id} no encontrado`);
            }),
            create: jest.fn().mockImplementation((input: CreateComplianceDto) => {
              return {
                id: '1',
                subtaskId: input.id_subtarea.toString(),
                statusId: input.id_cumplimiento_estado,
                applies: Boolean(input.aplica),
              };
            }),
            update: jest.fn().mockImplementation((id: string, input: UpdateComplianceDto) => {
              if (id !== '1' && id !== '2') {
                throw new NotFoundException(`Cumplimiento con ID ${id} no encontrado`);
              }
              return {
                id,
                subtaskId: input.id_subtarea ? input.id_subtarea.toString() : mockCompliance.subtaskId,
                statusId: input.id_cumplimiento_estado || mockCompliance.statusId,
                applies: input.aplica !== undefined ? Boolean(input.aplica) : mockCompliance.applies,
              };
            }),
            remove: jest.fn().mockImplementation((id: string) => {
              if (id !== '1' && id !== '2') {
                throw new NotFoundException(`Cumplimiento con ID ${id} no encontrado`);
              }
              return mockCompliance;
            }),
          },
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    }).compile();

    resolver = module.get<ComplianceResolver>(ComplianceResolver);
    service = module.get<ComplianceService>(ComplianceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('compliances', () => {
    it('debería retornar un array de cumplimientos', async () => {
      const result = await resolver.compliances();
      expect(result).toEqual([mockCompliance, mockCompliance2]);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('debería retornar cumplimientos filtrados por subtarea', async () => {
      const query = JSON.stringify({ subtaskId: '1' });
      const result = await resolver.compliances(query);
      expect(result).toEqual([mockCompliance]);
      expect(service.findAll).toHaveBeenCalledWith({ subtaskId: '1' });
    });

    it('debería retornar cumplimientos filtrados por estado', async () => {
      const query = JSON.stringify({ statusId: 1 });
      const result = await resolver.compliances(query);
      expect(result).toEqual([mockCompliance]);
      expect(service.findAll).toHaveBeenCalledWith({ statusId: 1 });
    });

    it('debería retornar cumplimientos filtrados por aplica', async () => {
      const query = JSON.stringify({ applies: true });
      const result = await resolver.compliances(query);
      expect(result).toEqual([mockCompliance]);
      expect(service.findAll).toHaveBeenCalledWith({ applies: true });
    });

    it('debería manejar query inválida', async () => {
      const query = 'invalid-json';
      await expect(resolver.compliances(query))
        .rejects.toThrow('Query inválida');
    });
  });

  describe('compliance', () => {
    it('debería retornar un único cumplimiento', async () => {
      const result = await resolver.compliance('1');
      expect(result).toEqual(mockCompliance);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('debería lanzar NotFoundException cuando el cumplimiento no existe', async () => {
      await expect(resolver.compliance('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('createCompliance', () => {
    it('debería crear un nuevo cumplimiento y transformar snake_case a camelCase', async () => {
      const createInput: CreateComplianceDto = {
        id_subtarea: 1,
        id_cumplimiento_estado: 1,
        aplica: 1,
      };
      const result = await resolver.createCompliance(createInput);
      expect(result).toEqual(mockCompliance);
      expect(service.create).toHaveBeenCalledWith(createInput);
    });

    it('debería validar campos requeridos', async () => {
      const createInput = {
        id_subtarea: 1,
        // Falta id_cumplimiento_estado que es requerido
        aplica: 1,
      };
      
      await expect(resolver.createCompliance(createInput as unknown as CreateComplianceDto))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos', async () => {
      const createInput = {
        id_subtarea: 1,
        id_cumplimiento_estado: '1', // Debería ser número
        aplica: '1', // Debería ser número
      };
      
      await expect(resolver.createCompliance(createInput as unknown as CreateComplianceDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCompliance', () => {
    it('debería actualizar un cumplimiento y transformar snake_case a camelCase', async () => {
      const updateInput: UpdateComplianceDto = {
        aplica: 0,
      };
      const result = await resolver.updateCompliance('1', updateInput);
      expect(result).toEqual({
        ...mockCompliance,
        applies: false,
      });
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });

    it('debería manejar actualización de cumplimiento inexistente', async () => {
      const updateInput: UpdateComplianceDto = {
        aplica: 0,
      };
      await expect(resolver.updateCompliance('999', updateInput))
        .rejects.toThrow(NotFoundException);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        id_cumplimiento_estado: '1', // Debería ser número
        aplica: '0', // Debería ser número
      };
      
      await expect(resolver.updateCompliance('1', updateInput as unknown as UpdateComplianceDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('removeCompliance', () => {
    it('debería eliminar un cumplimiento', async () => {
      const result = await resolver.removeCompliance('1');
      expect(result).toEqual(mockCompliance);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de cumplimiento inexistente', async () => {
      await expect(resolver.removeCompliance('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 