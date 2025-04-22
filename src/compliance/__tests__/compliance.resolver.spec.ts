import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceResolver } from '../compliance.resolver';
import { ComplianceService } from '../compliance.service';
import { Compliance, CreateComplianceInput, UpdateComplianceInput } from '../../graphql/graphql.types';

describe('ComplianceResolver', () => {
  let resolver: ComplianceResolver;
  let service: ComplianceService;

  const mockCompliance: Compliance = {
    id: '1',
    subtaskId: '1',
    statusId: 1,
    applies: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceResolver,
        {
          provide: ComplianceService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockCompliance]),
            findOne: jest.fn().mockResolvedValue(mockCompliance),
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

  it('debería estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('compliances', () => {
    it('debería retornar un array de cumplimientos', async () => {
      const result = await resolver.compliances();
      expect(result).toEqual([mockCompliance]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('compliance', () => {
    it('debería retornar un único cumplimiento', async () => {
      const result = await resolver.compliance('1');
      expect(result).toEqual(mockCompliance);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('crearCompliance', () => {
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
  });

  describe('actualizarCompliance', () => {
    it('debería actualizar un cumplimiento', async () => {
      const updateInput: UpdateComplianceInput = {
        applies: false,
      };
      const result = await resolver.updateCompliance('1', updateInput);
      expect(result).toEqual(mockCompliance);
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });
  });

  describe('eliminarCompliance', () => {
    it('debería eliminar un cumplimiento', async () => {
      const result = await resolver.deleteCompliance('1');
      expect(result).toEqual(mockCompliance);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
}); 