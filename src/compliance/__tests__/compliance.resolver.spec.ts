import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceResolver } from '../compliance.resolver';
import { ComplianceService } from '../compliance.service';
import { Compliance, CreateComplianceInput, UpdateComplianceInput } from '../../graphql/graphql.types';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
            create: jest.fn().mockResolvedValue(mockCompliance),
            update: jest.fn().mockResolvedValue(mockCompliance),
            remove: jest.fn().mockResolvedValue(mockCompliance),
          },
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
        .rejects.toThrow('Unexpected token \'i\', "invalid-json" is not valid JSON');
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
    it('debería crear un nuevo cumplimiento', async () => {
      const createInput: CreateComplianceInput = {
        subtaskId: '1',
        statusId: 1,
        applies: true,
      };
      const result = await resolver.createCompliance(createInput);
      expect(result).toEqual(mockCompliance);
      expect(service.create).toHaveBeenCalledWith(createInput);
    });

    it('debería validar campos requeridos', async () => {
      const createInput = {
        subtaskId: '1',
        // Falta statusId que es requerido
        applies: true,
      };
      
      jest.spyOn(service, 'create').mockRejectedValueOnce(
        new BadRequestException('Campos requeridos faltantes')
      );
      
      await expect(resolver.createCompliance(createInput as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos', async () => {
      const createInput = {
        subtaskId: '1',
        statusId: '1', // Debería ser número
        applies: 'true', // Debería ser boolean
      };
      
      jest.spyOn(service, 'create').mockRejectedValueOnce(
        new BadRequestException('Tipos de datos inválidos')
      );
      
      await expect(resolver.createCompliance(createInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCompliance', () => {
    it('debería actualizar un cumplimiento', async () => {
      const updateInput: UpdateComplianceInput = {
        applies: false,
      };
      const result = await resolver.updateCompliance('1', updateInput);
      expect(result).toEqual(mockCompliance);
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });

    it('debería manejar actualización de cumplimiento inexistente', async () => {
      const updateInput: UpdateComplianceInput = {
        applies: false,
      };
      jest.spyOn(service, 'update').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.updateCompliance('999', updateInput))
        .rejects.toThrow(NotFoundException);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        statusId: '1', // Debería ser número
        applies: 'false', // Debería ser boolean
      };
      
      jest.spyOn(service, 'update').mockRejectedValueOnce(
        new BadRequestException('Tipos de datos inválidos')
      );
      
      await expect(resolver.updateCompliance('1', updateInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCompliance', () => {
    it('debería eliminar un cumplimiento', async () => {
      const result = await resolver.deleteCompliance('1');
      expect(result).toEqual(mockCompliance);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de cumplimiento inexistente', async () => {
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.deleteCompliance('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 