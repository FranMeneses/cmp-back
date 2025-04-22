import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiariesResolver } from '../beneficiaries.resolver';
import { BeneficiariesService } from '../beneficiaries.service';
import { Beneficiary } from '../../graphql/graphql.types';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficiariesResolver,
        {
          provide: BeneficiariesService,
          useValue: {
            findAllBeneficiaries: jest.fn().mockResolvedValue([mockBeneficiary]),
            findOneBeneficiary: jest.fn().mockResolvedValue(mockBeneficiary),
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

  it('debería estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('beneficiarios', () => {
    it('debería retornar un array de beneficiarios', async () => {
      const result = await resolver.beneficiaries();
      expect(result).toEqual([mockBeneficiary]);
      expect(service.findAllBeneficiaries).toHaveBeenCalled();
    });
  });

  describe('beneficiario', () => {
    it('debería retornar un único beneficiario', async () => {
      const result = await resolver.beneficiary('1');
      expect(result).toEqual(mockBeneficiary);
      expect(service.findOneBeneficiary).toHaveBeenCalledWith('1');
    });
  });

  describe('crearBeneficiario', () => {
    it('debería crear un nuevo beneficiario', async () => {
      const createInput = {
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
  });

  describe('actualizarBeneficiario', () => {
    it('debería actualizar un beneficiario', async () => {
      const updateInput = {
        legalName: 'Updated Name',
      };
      const result = await resolver.updateBeneficiary('1', updateInput);
      expect(result).toEqual(mockBeneficiary);
      expect(service.updateBeneficiary).toHaveBeenCalledWith('1', updateInput);
    });
  });

  describe('eliminarBeneficiario', () => {
    it('debería eliminar un beneficiario', async () => {
      const result = await resolver.deleteBeneficiary('1');
      expect(result).toEqual(mockBeneficiary);
      expect(service.removeBeneficiary).toHaveBeenCalledWith('1');
    });
  });
}); 