import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiariesService } from '../beneficiaries.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBeneficiaryDto } from '../dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from '../dto/update-beneficiary.dto';
import { NotFoundException } from '@nestjs/common';

describe('BeneficiariesService', () => {
  let service: BeneficiariesService;
  let prismaService: PrismaService;

  const mockBeneficiary = {
    id_beneficiario: '1',
    nombre_legal: 'Test Beneficiary',
    rut: '12345678-9',
    direccion: 'Test Address',
    tipo_entidad: 'Test Type',
    representante: 'Test Representative',
    personalidad_juridica: true,
    contactos: [],
    subtareas: []
  };

  const mockPrismaService = {
    beneficiario: {
      create: jest.fn().mockResolvedValue(mockBeneficiary),
      findMany: jest.fn().mockResolvedValue([mockBeneficiary]),
      findUnique: jest.fn().mockResolvedValue(mockBeneficiary),
      update: jest.fn().mockResolvedValue(mockBeneficiary),
      delete: jest.fn().mockResolvedValue(mockBeneficiary),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficiariesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BeneficiariesService>(BeneficiariesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un nuevo beneficiario', async () => {
      const createBeneficiaryDto: CreateBeneficiaryDto = {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      };

      const result = await service.create(createBeneficiaryDto);

      expect(result).toEqual({
        id: '1',
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
        contacts: [],
        subtasks: []
      });

      expect(prismaService.beneficiario.create).toHaveBeenCalledWith({
        data: {
          nombre_legal: 'Test Beneficiary',
          rut: '12345678-9',
          direccion: 'Test Address',
          tipo_entidad: 'Test Type',
          representante: 'Test Representative',
          personalidad_juridica: true
        },
        include: {
          contactos: true,
          subtareas: {
            include: {
              subtarea_estado: true
            }
          }
        }
      });
    });

    it('debería manejar correctamente los campos opcionales', async () => {
      const createBeneficiaryDto: CreateBeneficiaryDto = {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        hasLegalPersonality: true
      };

      const mockBeneficiaryWithNullFields = {
        ...mockBeneficiary,
        direccion: null,
        tipo_entidad: null,
        representante: null
      };

      jest.spyOn(prismaService.beneficiario, 'create').mockResolvedValue(mockBeneficiaryWithNullFields);

      const result = await service.create(createBeneficiaryDto);

      expect(result).toEqual({
        id: '1',
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: null,
        entityType: null,
        representative: null,
        hasLegalPersonality: true,
        contacts: [],
        subtasks: []
      });
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los beneficiarios', async () => {
      const result = await service.findAll();

      expect(result).toEqual([{
        id: '1',
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
        contacts: [],
        subtasks: []
      }]);

      expect(prismaService.beneficiario.findMany).toHaveBeenCalledWith({
        include: {
          contactos: true,
          subtareas: {
            include: {
              subtarea_estado: true
            }
          }
        }
      });
    });

    it('debería retornar un array vacío cuando no hay beneficiarios', async () => {
      jest.spyOn(prismaService.beneficiario, 'findMany').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería retornar un beneficiario por su ID', async () => {
      const result = await service.findOne('1');

      expect(result).toEqual({
        id: '1',
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
        contacts: [],
        subtasks: []
      });

      expect(prismaService.beneficiario.findUnique).toHaveBeenCalledWith({
        where: { id_beneficiario: '1' },
        include: {
          contactos: true,
          subtareas: {
            include: {
              subtarea_estado: true
            }
          }
        }
      });
    });

    it('debería retornar null cuando el beneficiario no existe', async () => {
      jest.spyOn(prismaService.beneficiario, 'findUnique').mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });

    it('debería manejar correctamente los contactos y subtareas', async () => {
      const mockBeneficiaryWithRelations = {
        ...mockBeneficiary,
        contactos: [
          {
            id_contacto: '1',
            nombre: 'Contact 1',
            mail: 'contact1@test.com',
            phone: '123456789',
            id_beneficiario: '1'
          }
        ],
        subtareas: [
          {
            id_subtarea: '1',
            nombre: 'Subtarea 1',
            descripcion: 'Descripción de la subtarea',
            fecha_inicio: new Date('2024-01-01'),
            fecha_termino: new Date('2024-01-02'),
            subtarea_estado: {
              id_subtarea_estado: '1',
              estado: 'Pendiente',
              porcentaje: 0
            }
          }
        ]
      };

      jest.spyOn(prismaService.beneficiario, 'findUnique').mockResolvedValue(mockBeneficiaryWithRelations);

      const result = await service.findOne('1');

      expect(result.contacts).toHaveLength(1);
      expect(result.subtasks).toHaveLength(1);
      expect(result.subtasks[0]).toEqual({
        id: '1',
        name: 'Subtarea 1',
        description: 'Descripción de la subtarea',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02'),
        status: {
          id: '1',
          name: 'Pendiente',
          percentage: 0
        }
      });
    });
  });

  describe('update', () => {
    it('debería actualizar un beneficiario', async () => {
      const updateBeneficiaryDto: UpdateBeneficiaryDto = {
        legalName: 'Updated Beneficiary',
        rut: '98765432-1',
      };

      const result = await service.update('1', updateBeneficiaryDto);

      expect(result).toEqual({
        id: '1',
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
        contacts: [],
        subtasks: []
      });

      expect(prismaService.beneficiario.update).toHaveBeenCalledWith({
        where: { id_beneficiario: '1' },
        data: {
          nombre_legal: 'Updated Beneficiary',
          rut: '98765432-1',
        },
        include: {
          contactos: true,
          subtareas: {
            include: {
              subtarea_estado: true
            }
          }
        }
      });
    });

    it('debería lanzar NotFoundException cuando el beneficiario no existe', async () => {
      jest.spyOn(prismaService.beneficiario, 'update').mockRejectedValue(new NotFoundException('Beneficiario no encontrado'));

      await expect(service.update('999', {} as UpdateBeneficiaryDto))
        .rejects.toThrow(NotFoundException);
    });

    it('debería actualizar solo los campos proporcionados', async () => {
      const updateBeneficiaryDto: UpdateBeneficiaryDto = {
        legalName: 'Updated Name'
      };

      jest.spyOn(prismaService.beneficiario, 'update').mockResolvedValue(mockBeneficiary);

      const result = await service.update('1', updateBeneficiaryDto);

      expect(prismaService.beneficiario.update).toHaveBeenCalledWith({
        where: { id_beneficiario: '1' },
        data: {
          nombre_legal: 'Updated Name'
        },
        include: {
          contactos: true,
          subtareas: {
            include: {
              subtarea_estado: true
            }
          }
        }
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar un beneficiario', async () => {
      const result = await service.remove('1');

      expect(result).toEqual({
        id: '1',
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
        contacts: [],
        subtasks: []
      });

      expect(prismaService.beneficiario.delete).toHaveBeenCalledWith({
        where: { id_beneficiario: '1' },
        include: {
          contactos: true,
          subtareas: {
            include: {
              subtarea_estado: true
            }
          }
        }
      });
    });

    it('debería lanzar NotFoundException cuando el beneficiario no existe', async () => {
      jest.spyOn(prismaService.beneficiario, 'delete').mockRejectedValue(new NotFoundException());

      await expect(service.remove('999'))
        .rejects.toThrow(NotFoundException);
    });

    it('debería eliminar también los contactos asociados', async () => {
      const mockBeneficiaryWithContacts = {
        ...mockBeneficiary,
        contactos: [
          {
            id_contacto: '1',
            nombre: 'Contact 1',
            email: 'contact1@test.com',
            telefono: '123456789',
            id_beneficiario: '1'
          }
        ]
      };

      jest.spyOn(prismaService.beneficiario, 'delete').mockResolvedValue(mockBeneficiaryWithContacts);

      const result = await service.remove('1');

      expect(result.contacts).toHaveLength(1);
      expect(prismaService.beneficiario.delete).toHaveBeenCalledWith({
        where: { id_beneficiario: '1' },
        include: {
          contactos: true,
          subtareas: {
            include: {
              subtarea_estado: true
            }
          }
        }
      });
    });
  });
});
