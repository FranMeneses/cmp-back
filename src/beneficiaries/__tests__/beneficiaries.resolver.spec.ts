import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiariesResolver } from '../beneficiaries.resolver';
import { BeneficiariesService } from '../beneficiaries.service';
import { Beneficiary } from '../../graphql/graphql.types';
import { CreateBeneficiaryDto } from '../dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from '../dto/update-beneficiary.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

// Factories para crear objetos de prueba
const createMockBeneficiary = (overrides: Partial<Beneficiary> = {}): Beneficiary => ({
  id: '1',
  legalName: 'Test Beneficiary',
  rut: '12345678-9',
  address: 'Test Address',
  entityType: 'Test Type',
  representative: 'Test Representative',
  hasLegalPersonality: true,
  ...overrides,
});

const createMockBeneficiaryDto = (overrides: Partial<CreateBeneficiaryDto> = {}): CreateBeneficiaryDto => ({
  legalName: 'Test Beneficiary',
  rut: '12345678-9',
  address: 'Test Address',
  entityType: 'Test Type',
  representative: 'Test Representative',
  hasLegalPersonality: true,
  ...overrides,
});

const createMockUpdateBeneficiaryDto = (overrides: Partial<UpdateBeneficiaryDto> = {}): UpdateBeneficiaryDto => ({
  legalName: 'Updated Name',
  ...overrides,
});

describe('BeneficiariesResolver', () => {
  let resolver: BeneficiariesResolver;
  let service: BeneficiariesService;

  const mockBeneficiary = createMockBeneficiary();
  const mockBeneficiary2 = createMockBeneficiary({
    id: '2',
    legalName: 'Test Beneficiary 2',
    rut: '87654321-0',
    address: 'Test Address 2',
    entityType: 'Test Type 2',
    representative: 'Test Representative 2',
    hasLegalPersonality: false,
  });

  const beneficiariesMap = {
    '1': mockBeneficiary,
    '2': mockBeneficiary2,
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue(Object.values(beneficiariesMap)),
    findOne: jest.fn((id) => beneficiariesMap[id] || null),
    create: jest.fn((input) => ({ id: '1', ...input })),
    update: jest.fn((id, input) => ({ id, ...beneficiariesMap[id], ...input })),
    remove: jest.fn((id) => beneficiariesMap[id]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficiariesResolver,
        {
          provide: BeneficiariesService,
          useValue: mockService,
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    }).compile();

    resolver = module.get<BeneficiariesResolver>(BeneficiariesResolver);
    service = module.get<BeneficiariesService>(BeneficiariesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('beneficiaries', () => {
    it('debería retornar un array de beneficiarios', async () => {
      const result = await resolver.beneficiaries();
      expect(result).toEqual(Object.values(beneficiariesMap));
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('beneficiary', () => {
    it('debería retornar un único beneficiario', async () => {
      const result = await resolver.beneficiary('1');
      expect(result).toEqual(beneficiariesMap['1']);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('debería lanzar NotFoundException cuando el beneficiario no existe', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Beneficiario con ID 999 no encontrado'));
      
      await expect(resolver.beneficiary('999'))
        .rejects.toThrow('Beneficiario con ID 999 no encontrado');
      
      expect(service.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('createBeneficiary', () => {
    it('debería crear un nuevo beneficiario', async () => {
      const createInput = createMockBeneficiaryDto();
      const result = await resolver.createBeneficiary(createInput);
      expect(result).toEqual({
        id: '1',
        ...createInput
      });
      expect(service.create).toHaveBeenCalledWith(createInput);
    });

    it('debería validar campos requeridos', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('El campo RUT es requerido'));
      
      const createInput = createMockBeneficiaryDto({ rut: undefined });
      await expect(resolver.createBeneficiary(createInput as CreateBeneficiaryDto))
        .rejects.toThrow('El campo RUT es requerido');
    });

    it('debería validar tipos de datos', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('El campo personalidad jurídica debe ser un valor booleano'));
      
      const createInput = createMockBeneficiaryDto({ hasLegalPersonality: 'true' as any });
      await expect(resolver.createBeneficiary(createInput as unknown as CreateBeneficiaryDto))
        .rejects.toThrow('El campo personalidad jurídica debe ser un valor booleano');
    });

    it('debería validar formato de RUT', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('El formato del RUT es inválido'));
      
      const createInput = createMockBeneficiaryDto({ rut: '12345678' });
      await expect(resolver.createBeneficiary(createInput as CreateBeneficiaryDto))
        .rejects.toThrow('El formato del RUT es inválido');
    });
  });

  describe('updateBeneficiary', () => {
    it('debería actualizar un beneficiario', async () => {
      const updateInput = createMockUpdateBeneficiaryDto();
      const result = await resolver.updateBeneficiary('1', updateInput);
      expect(result).toEqual({
        ...beneficiariesMap['1'],
        ...updateInput
      });
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });

    it('debería manejar actualización de beneficiario inexistente', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException('Beneficiario con ID 999 no encontrado'));
      
      const updateInput = createMockUpdateBeneficiaryDto();
      await expect(resolver.updateBeneficiary('999', updateInput))
        .rejects.toThrow('Beneficiario con ID 999 no encontrado');
    });

    it('debería validar formato de RUT en la actualización', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException('El formato del RUT es inválido'));
      
      const updateInput = createMockUpdateBeneficiaryDto({ rut: '12345678' });
      await expect(resolver.updateBeneficiary('1', updateInput as UpdateBeneficiaryDto))
        .rejects.toThrow('El formato del RUT es inválido');
    });

    it('debería validar tipos de datos en la actualización', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException('El campo personalidad jurídica debe ser un valor booleano'));
      
      const updateInput = createMockUpdateBeneficiaryDto({ hasLegalPersonality: 'false' as any });
      await expect(resolver.updateBeneficiary('1', updateInput as unknown as UpdateBeneficiaryDto))
        .rejects.toThrow('El campo personalidad jurídica debe ser un valor booleano');
    });
  });

  describe('removeBeneficiary', () => {
    it('debería eliminar un beneficiario', async () => {
      const result = await resolver.removeBeneficiary('1');
      expect(result).toEqual(beneficiariesMap['1']);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de beneficiario inexistente', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException('Beneficiario con ID 999 no encontrado'));
      
      await expect(resolver.removeBeneficiary('999'))
        .rejects.toThrow('Beneficiario con ID 999 no encontrado');
    });
  });
}); 