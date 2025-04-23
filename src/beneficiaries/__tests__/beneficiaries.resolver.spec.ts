import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiariesResolver } from '../beneficiaries.resolver';
import { BeneficiariesService } from '../beneficiaries.service';
import { Beneficiary, CreateBeneficiaryInput, UpdateBeneficiaryInput } from '../../graphql/graphql.types';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BeneficiariesResolver', () => {
  let resolver: BeneficiariesResolver;
  let service: BeneficiariesService;

  const mockBeneficiary: Beneficiary = {
    id: '1',
    legalName: 'Test Beneficiary',
    rut: '12345678-9',
    address: 'Test Address',
    entityType: 'Test Type',
    representative: 'Test Representative',
    hasLegalPersonality: true,
  };

  const mockBeneficiary2: Beneficiary = {
    id: '2',
    legalName: 'Test Beneficiary 2',
    rut: '87654321-0',
    address: 'Test Address 2',
    entityType: 'Test Type 2',
    representative: 'Test Representative 2',
    hasLegalPersonality: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficiariesResolver,
        {
          provide: BeneficiariesService,
          useValue: {
            findAllBeneficiaries: jest.fn().mockImplementation((query) => {
              if (!query || Object.keys(query).length === 0) {
                return [mockBeneficiary, mockBeneficiary2];
              }
              if (query.legalName === 'Test Beneficiary') {
                return [mockBeneficiary];
              }
              if (query.rut === '12345678-9') {
                return [mockBeneficiary];
              }
              if (query.entityType === 'Test Type') {
                return [mockBeneficiary];
              }
              return [];
            }),
            findOneBeneficiary: jest.fn().mockImplementation((id) => {
              if (id === '1') return mockBeneficiary;
              if (id === '2') return mockBeneficiary2;
              throw new NotFoundException(`Beneficiario con ID ${id} no encontrado`);
            }),
            createBeneficiary: jest.fn().mockResolvedValue(mockBeneficiary),
            updateBeneficiary: jest.fn().mockResolvedValue(mockBeneficiary),
            removeBeneficiary: jest.fn().mockResolvedValue(mockBeneficiary),
          },
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
      expect(result).toEqual([mockBeneficiary, mockBeneficiary2]);
      expect(service.findAllBeneficiaries).toHaveBeenCalledWith({});
    });

    it('debería retornar beneficiarios filtrados por nombre legal', async () => {
      const query = JSON.stringify({ legalName: 'Test Beneficiary' });
      const result = await resolver.beneficiaries(query);
      expect(result).toEqual([mockBeneficiary]);
      expect(service.findAllBeneficiaries).toHaveBeenCalledWith({ legalName: 'Test Beneficiary' });
    });

    it('debería retornar beneficiarios filtrados por RUT', async () => {
      const query = JSON.stringify({ rut: '12345678-9' });
      const result = await resolver.beneficiaries(query);
      expect(result).toEqual([mockBeneficiary]);
      expect(service.findAllBeneficiaries).toHaveBeenCalledWith({ rut: '12345678-9' });
    });

    it('debería retornar beneficiarios filtrados por tipo de entidad', async () => {
      const query = JSON.stringify({ entityType: 'Test Type' });
      const result = await resolver.beneficiaries(query);
      expect(result).toEqual([mockBeneficiary]);
      expect(service.findAllBeneficiaries).toHaveBeenCalledWith({ entityType: 'Test Type' });
    });

    it('debería manejar query inválida', async () => {
      const query = 'invalid-json';
      await expect(resolver.beneficiaries(query))
        .rejects.toThrow('Unexpected token \'i\', "invalid-json" is not valid JSON');
    });
  });

  describe('beneficiary', () => {
    it('debería retornar un único beneficiario', async () => {
      const result = await resolver.beneficiary('1');
      expect(result).toEqual(mockBeneficiary);
      expect(service.findOneBeneficiary).toHaveBeenCalledWith('1');
    });

    it('debería lanzar NotFoundException cuando el beneficiario no existe', async () => {
      await expect(resolver.beneficiary('999')).rejects.toThrow(NotFoundException);
      expect(service.findOneBeneficiary).toHaveBeenCalledWith('999');
    });
  });

  describe('createBeneficiary', () => {
    it('debería crear un nuevo beneficiario', async () => {
      const createInput: CreateBeneficiaryInput = {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      };
      const result = await resolver.createBeneficiary(createInput);
      expect(result).toEqual(mockBeneficiary);
      expect(service.createBeneficiary).toHaveBeenCalledWith(createInput);
    });

    it('debería validar campos requeridos', async () => {
      const createInput = {
        legalName: 'Test Beneficiary',
        // Falta rut que es requerido
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      };
      
      jest.spyOn(service, 'createBeneficiary').mockRejectedValueOnce(
        new BadRequestException('Campos requeridos faltantes')
      );
      
      await expect(resolver.createBeneficiary(createInput as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar formato de RUT', async () => {
      const createInput = {
        legalName: 'Test Beneficiary',
        rut: '12345678', // RUT inválido
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      };
      
      jest.spyOn(service, 'createBeneficiary').mockRejectedValueOnce(
        new BadRequestException('Formato de RUT inválido')
      );
      
      await expect(resolver.createBeneficiary(createInput as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos', async () => {
      const createInput = {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: 'true', // Debería ser boolean
      };
      
      jest.spyOn(service, 'createBeneficiary').mockRejectedValueOnce(
        new BadRequestException('Tipos de datos inválidos')
      );
      
      await expect(resolver.createBeneficiary(createInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateBeneficiary', () => {
    it('debería actualizar un beneficiario', async () => {
      const updateInput: UpdateBeneficiaryInput = {
        legalName: 'Updated Name',
      };
      const result = await resolver.updateBeneficiary('1', updateInput);
      expect(result).toEqual(mockBeneficiary);
      expect(service.updateBeneficiary).toHaveBeenCalledWith('1', updateInput);
    });

    it('debería manejar actualización de beneficiario inexistente', async () => {
      const updateInput: UpdateBeneficiaryInput = {
        legalName: 'Updated Name',
      };
      jest.spyOn(service, 'updateBeneficiary').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.updateBeneficiary('999', updateInput))
        .rejects.toThrow(NotFoundException);
    });

    it('debería validar formato de RUT en la actualización', async () => {
      const updateInput = {
        rut: '12345678', // RUT inválido
      };
      
      jest.spyOn(service, 'updateBeneficiary').mockRejectedValueOnce(
        new BadRequestException('Formato de RUT inválido')
      );
      
      await expect(resolver.updateBeneficiary('1', updateInput as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        hasLegalPersonality: 'false', // Debería ser boolean
      };
      
      jest.spyOn(service, 'updateBeneficiary').mockRejectedValueOnce(
        new BadRequestException('Tipos de datos inválidos')
      );
      
      await expect(resolver.updateBeneficiary('1', updateInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteBeneficiary', () => {
    it('debería eliminar un beneficiario', async () => {
      const result = await resolver.deleteBeneficiary('1');
      expect(result).toEqual(mockBeneficiary);
      expect(service.removeBeneficiary).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de beneficiario inexistente', async () => {
      jest.spyOn(service, 'removeBeneficiary').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.deleteBeneficiary('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 