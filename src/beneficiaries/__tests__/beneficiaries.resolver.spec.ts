import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiariesResolver } from '../beneficiaries.resolver';
import { BeneficiariesService } from '../beneficiaries.service';
import { Beneficiary } from '../../graphql/graphql.types';
import { CreateBeneficiaryDto } from '../dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from '../dto/update-beneficiary.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

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

  const mockService = {
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
    createBeneficiary: jest.fn().mockImplementation((input: CreateBeneficiaryDto) => {
      return {
        id: '1',
        legalName: input.nombre_legal,
        rut: input.rut,
        address: input.direccion,
        entityType: input.tipo_entidad,
        representative: input.representante,
        hasLegalPersonality: Boolean(input.personalidad_juridica),
      };
    }),
    updateBeneficiary: jest.fn().mockImplementation((id: string, input: UpdateBeneficiaryDto) => {
      return {
        id,
        legalName: input.nombre_legal || mockBeneficiary.legalName,
        rut: input.rut || mockBeneficiary.rut,
        address: input.direccion || mockBeneficiary.address,
        entityType: input.tipo_entidad || mockBeneficiary.entityType,
        representative: input.representante || mockBeneficiary.representative,
        hasLegalPersonality: input.personalidad_juridica !== undefined 
          ? Boolean(input.personalidad_juridica) 
          : mockBeneficiary.hasLegalPersonality,
      };
    }),
    removeBeneficiary: jest.fn().mockResolvedValue(mockBeneficiary),
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
        .rejects.toThrow('Query inválida');
    });
  });

  describe('beneficiary', () => {
    it('debería retornar un único beneficiario', async () => {
      const result = await resolver.beneficiary('1');
      expect(result).toEqual(mockBeneficiary);
      expect(service.findOneBeneficiary).toHaveBeenCalledWith('1');
    });

    it('debería lanzar NotFoundException cuando el beneficiario no existe', async () => {
      await expect(resolver.beneficiary('999')).rejects.toThrow('Beneficiario con ID 999 no encontrado');
      expect(service.findOneBeneficiary).toHaveBeenCalledWith('999');
    });
  });

  describe('createBeneficiary', () => {
    it('debería crear un nuevo beneficiario y transformar snake_case a camelCase', async () => {
      const createInput: CreateBeneficiaryDto = {
        nombre_legal: 'Test Beneficiary',
        rut: '12345678-9',
        direccion: 'Test Address',
        tipo_entidad: 'Test Type',
        representante: 'Test Representative',
        personalidad_juridica: 1,
      };
      const result = await resolver.createBeneficiary(createInput);
      expect(result).toEqual(mockBeneficiary);
      expect(service.createBeneficiary).toHaveBeenCalledWith(createInput);
    });

    it('debería validar campos requeridos', async () => {
      const createInput = {
        nombre_legal: 'Test Beneficiary',
        // Falta rut que es requerido
        direccion: 'Test Address',
        tipo_entidad: 'Test Type',
        representante: 'Test Representative',
        personalidad_juridica: 1,
      };
      
      await expect(resolver.createBeneficiary(createInput as CreateBeneficiaryDto))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos', async () => {
      const createInput = {
        nombre_legal: 'Test Beneficiary',
        rut: '12345678-9',
        direccion: 'Test Address',
        tipo_entidad: 'Test Type',
        representante: 'Test Representative',
        personalidad_juridica: '1', // Debería ser number
      };
      
      await expect(resolver.createBeneficiary(createInput as unknown as CreateBeneficiaryDto))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar formato de RUT', async () => {
      const createInput = {
        nombre_legal: 'Test Beneficiary',
        rut: '12345678', // RUT inválido (sin guión ni dígito verificador)
        direccion: 'Test Address',
        tipo_entidad: 'Test Type',
        representante: 'Test Representative',
        personalidad_juridica: 1,
      };
      
      await expect(resolver.createBeneficiary(createInput as CreateBeneficiaryDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateBeneficiary', () => {
    it('debería actualizar un beneficiario y transformar snake_case a camelCase', async () => {
      const updateInput: UpdateBeneficiaryDto = {
        nombre_legal: 'Updated Name',
      };
      const result = await resolver.updateBeneficiary('1', updateInput);
      expect(result).toEqual({
        ...mockBeneficiary,
        legalName: 'Updated Name',
      });
      expect(service.updateBeneficiary).toHaveBeenCalledWith('1', updateInput);
    });

    it('debería manejar actualización de beneficiario inexistente', async () => {
      const updateInput: UpdateBeneficiaryDto = {
        nombre_legal: 'Updated Name',
      };
      jest.spyOn(service, 'updateBeneficiary').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.updateBeneficiary('999', updateInput))
        .rejects.toThrow(NotFoundException);
    });

    it('debería validar formato de RUT en la actualización', async () => {
      const updateInput = {
        rut: '12345678', // RUT inválido (sin guión ni dígito verificador)
      };
      
      await expect(resolver.updateBeneficiary('1', updateInput as UpdateBeneficiaryDto))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        personalidad_juridica: '0', // Debería ser number
      };
      
      await expect(resolver.updateBeneficiary('1', updateInput as unknown as UpdateBeneficiaryDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('removeBeneficiary', () => {
    it('debería eliminar un beneficiario', async () => {
      const result = await resolver.removeBeneficiary('1');
      expect(result).toEqual(mockBeneficiary);
      expect(service.removeBeneficiary).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de beneficiario inexistente', async () => {
      jest.spyOn(service, 'removeBeneficiary').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.removeBeneficiary('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 