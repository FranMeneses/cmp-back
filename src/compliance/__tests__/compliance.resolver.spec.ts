import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceResolver } from '../compliance.resolver';
import { ComplianceService } from '../compliance.service';
import { Compliance } from '../../graphql/graphql.types';
import { CreateComplianceDto } from '../dto/create-compliance.dto';
import { UpdateComplianceDto } from '../dto/update-compliance.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

/**
 * @description
 * En este módulo, el campo 'aplica' se maneja de la siguiente manera:
 * - En los DTOs (CreateComplianceDto y UpdateComplianceDto) se espera como número (1 o 0)
 * - En la base de datos se almacena como booleano
 * - En la respuesta de la API se devuelve como booleano
 * 
 * Ejemplo:
 * - Input: { aplica: 1 } -> DB: { aplica: true } -> Output: { applies: true }
 * - Input: { aplica: 0 } -> DB: { aplica: false } -> Output: { applies: false }
 */
describe('ComplianceResolver', () => {
  let resolver: ComplianceResolver;
  let service: ComplianceService;
  let mockService: jest.Mocked<ComplianceService>;

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
    mockService = {
      findAll: jest.fn().mockImplementation((query) => {
        let results = [mockCompliance, mockCompliance2];
        
        if (query?.subtaskId) {
          results = results.filter(r => r.subtaskId === query.subtaskId);
        }
        if (query?.statusId) {
          results = results.filter(r => r.statusId === query.statusId);
        }
        if (query?.applies !== undefined) {
          results = results.filter(r => r.applies === query.applies);
        }
        
        return results;
      }),
      findOne: jest.fn((id) => {
        if (id === '1') return Promise.resolve(mockCompliance);
        if (id === '2') return Promise.resolve(mockCompliance2);
        return Promise.reject(new NotFoundException(`Cumplimiento con ID ${id} no encontrado`));
      }),
      create: jest.fn((input: CreateComplianceDto) => {
        if (!input.id_subtarea || !input.id_cumplimiento_estado || input.aplica === undefined) {
          return Promise.reject(new BadRequestException('Los campos id_subtarea, id_cumplimiento_estado y aplica son requeridos'));
        }
        if (typeof input.id_subtarea !== 'number' || typeof input.id_cumplimiento_estado !== 'number' || typeof input.aplica !== 'number') {
          return Promise.reject(new BadRequestException('Los campos id_subtarea, id_cumplimiento_estado y aplica deben ser números'));
        }
        return Promise.resolve({
          id: '1',
          subtaskId: input.id_subtarea.toString(),
          statusId: input.id_cumplimiento_estado,
          applies: Boolean(input.aplica),
        });
      }),
      update: jest.fn((id: string, input: UpdateComplianceDto) => {
        if (id !== '1' && id !== '2') {
          return Promise.reject(new NotFoundException(`Cumplimiento con ID ${id} no encontrado`));
        }
        if (input.id_subtarea && typeof input.id_subtarea !== 'number') {
          return Promise.reject(new BadRequestException('id_subtarea debe ser un número'));
        }
        if (input.id_cumplimiento_estado && typeof input.id_cumplimiento_estado !== 'number') {
          return Promise.reject(new BadRequestException('id_cumplimiento_estado debe ser un número'));
        }
        if (input.aplica !== undefined && typeof input.aplica !== 'number') {
          return Promise.reject(new BadRequestException('aplica debe ser un número'));
        }
        return Promise.resolve({
          id,
          subtaskId: input.id_subtarea ? input.id_subtarea.toString() : mockCompliance.subtaskId,
          statusId: input.id_cumplimiento_estado || mockCompliance.statusId,
          applies: input.aplica !== undefined ? Boolean(input.aplica) : mockCompliance.applies,
        });
      }),
      remove: jest.fn((id: string) => {
        if (id !== '1' && id !== '2') {
          return Promise.reject(new NotFoundException(`Cumplimiento con ID ${id} no encontrado`));
        }
        return Promise.resolve(mockCompliance);
      }),
    } as unknown as jest.Mocked<ComplianceService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceResolver,
        {
          provide: ComplianceService,
          useValue: mockService,
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
      expect(service.findAll).toHaveBeenCalled();
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

    it('debería retornar cumplimientos filtrados por múltiples campos', async () => {
      const query = JSON.stringify({ subtaskId: '1', statusId: 1, applies: true });
      const result = await resolver.compliances(query);
      expect(result).toEqual([mockCompliance]);
      expect(service.findAll).toHaveBeenCalledWith({ subtaskId: '1', statusId: 1, applies: true });
    });

    it('debería manejar query inválida', async () => {
      const query = 'invalid-json';
      await expect(resolver.compliances(query))
        .rejects.toThrow(BadRequestException);
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