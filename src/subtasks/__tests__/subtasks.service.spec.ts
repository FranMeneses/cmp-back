import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksService } from '../subtasks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SubtasksService', () => {
  let service: SubtasksService;
  let prismaService: PrismaService;

  const mockSubtask = {
    id_subtarea: '1',
    numero: 1,
    nombre: 'Test Subtask',
    descripcion: 'Test Description',
    presupuesto: 1000,
    gasto: 500,
    fecha_inicio: new Date('2024-01-01'),
    fecha_termino: new Date('2024-01-31'),
    fecha_final: new Date('2024-01-31'),
    id_beneficiario: '1',
    id_estado: 1,
    id_prioridad: 1,
    id_tarea: '1',
    subtarea_estado: {
      id_subtarea_estado: 1,
      estado: 'En Progreso',
      porcentaje: 50
    },
    prioridad: {
      id_prioridad: 1,
      prioridad_name: 'Alta'
    }
  };

  const mockSubtask2 = {
    id_subtarea: '2',
    numero: 2,
    nombre: 'Test Subtask 2',
    descripcion: 'Test Description 2',
    presupuesto: 2000,
    gasto: 1000,
    fecha_inicio: new Date('2024-02-01'),
    fecha_termino: new Date('2024-02-28'),
    fecha_final: new Date('2024-02-28'),
    id_beneficiario: '2',
    id_estado: 2,
    id_prioridad: 2,
    id_tarea: '1',
    subtarea_estado: {
      id_subtarea_estado: 2,
      estado: 'Completada',
      porcentaje: 100
    },
    prioridad: {
      id_prioridad: 2,
      prioridad_name: 'Media'
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksService,
        {
          provide: PrismaService,
          useValue: {
            subtarea: {
              create: jest.fn().mockResolvedValue(mockSubtask),
              findMany: jest.fn().mockResolvedValue([mockSubtask, mockSubtask2]),
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id_subtarea === '1') return Promise.resolve(mockSubtask);
                if (where.id_subtarea === '2') return Promise.resolve(mockSubtask2);
                return Promise.resolve(null);
              }),
              update: jest.fn().mockImplementation(({ where, data }) => {
                if (where.id_subtarea === '1') {
                  return Promise.resolve({ ...mockSubtask, ...data });
                }
                if (where.id_subtarea === '2') {
                  return Promise.resolve({ ...mockSubtask2, ...data });
                }
                return Promise.reject(new Error('Not Found'));
              }),
              delete: jest.fn().mockImplementation(({ where }) => {
                if (where.id_subtarea === '1') {
                  return Promise.resolve(mockSubtask);
                }
                if (where.id_subtarea === '2') {
                  return Promise.resolve(mockSubtask2);
                }
                return Promise.reject(new Error('Not Found'));
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SubtasksService>(SubtasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una nueva subtarea', async () => {
      const createSubtaskDto = {
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        finalDate: new Date('2024-01-31'),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
      };

      const result = await service.create(createSubtaskDto);
      expect(result).toEqual({
        id: '1',
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        finalDate: new Date('2024-01-31'),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
        status: {
          id: 1,
          name: 'En Progreso',
          percentage: 50
        },
        priority: {
          id: 1,
          name: 'Alta'
        }
      });
      expect(prismaService.subtarea.create).toHaveBeenCalledWith({
        data: {
          numero: 1,
          nombre: 'Test Subtask',
          descripcion: 'Test Description',
          presupuesto: 1000,
          gasto: 500,
          fecha_inicio: new Date('2024-01-01'),
          fecha_termino: new Date('2024-01-31'),
          fecha_final: new Date('2024-01-31'),
          id_beneficiario: '1',
          id_estado: 1,
          id_prioridad: 1,
          id_tarea: '1'
        },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las subtareas', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        {
          id: '1',
          taskId: '1',
          number: 1,
          name: 'Test Subtask',
          description: 'Test Description',
          budget: 1000,
          expense: 500,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          finalDate: new Date('2024-01-31'),
          beneficiaryId: '1',
          statusId: 1,
          priorityId: 1,
          status: {
            id: 1,
            name: 'En Progreso',
            percentage: 50
          },
          priority: {
            id: 1,
            name: 'Alta'
          }
        },
        {
          id: '2',
          taskId: '1',
          number: 2,
          name: 'Test Subtask 2',
          description: 'Test Description 2',
          budget: 2000,
          expense: 1000,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-28'),
          finalDate: new Date('2024-02-28'),
          beneficiaryId: '2',
          statusId: 2,
          priorityId: 2,
          status: {
            id: 2,
            name: 'Completada',
            percentage: 100
          },
          priority: {
            id: 2,
            name: 'Media'
          }
        }
      ]);
      expect(prismaService.subtarea.findMany).toHaveBeenCalledWith({
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar una subtarea por id', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual({
        id: '1',
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        finalDate: new Date('2024-01-31'),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
        status: {
          id: 1,
          name: 'En Progreso',
          percentage: 50
        },
        priority: {
          id: 1,
          name: 'Alta'
        }
      });
      expect(prismaService.subtarea.findUnique).toHaveBeenCalledWith({
        where: { id_subtarea: '1' },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });

    it('debería lanzar NotFoundException cuando la subtarea no existe', async () => {
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(prismaService.subtarea.findUnique).toHaveBeenCalledWith({
        where: { id_subtarea: '999' },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });
  });

  describe('update', () => {
    it('debería actualizar una subtarea', async () => {
      const updateSubtaskDto = {
        name: 'Updated Subtask',
        description: 'Updated Description',
        budget: 1500
      };

      const result = await service.update('1', updateSubtaskDto);
      expect(result).toEqual({
        id: '1',
        taskId: '1',
        number: 1,
        name: 'Updated Subtask',
        description: 'Updated Description',
        budget: 1500,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        finalDate: new Date('2024-01-31'),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
        status: {
          id: 1,
          name: 'En Progreso',
          percentage: 50
        },
        priority: {
          id: 1,
          name: 'Alta'
        }
      });
      expect(prismaService.subtarea.update).toHaveBeenCalledWith({
        where: { id_subtarea: '1' },
        data: {
          nombre: 'Updated Subtask',
          descripcion: 'Updated Description',
          presupuesto: 1500
        },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });

    it('debería lanzar NotFoundException cuando la subtarea no existe', async () => {
      const updateSubtaskDto = {
        name: 'Updated Subtask'
      };

      await expect(service.update('999', updateSubtaskDto)).rejects.toThrow(NotFoundException);
      expect(prismaService.subtarea.update).toHaveBeenCalledWith({
        where: { id_subtarea: '999' },
        data: {
          nombre: 'Updated Subtask'
        },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar una subtarea', async () => {
      const result = await service.remove('1');
      expect(result).toEqual({
        id: '1',
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        finalDate: new Date('2024-01-31'),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
        status: {
          id: 1,
          name: 'En Progreso',
          percentage: 50
        },
        priority: {
          id: 1,
          name: 'Alta'
        }
      });
      expect(prismaService.subtarea.delete).toHaveBeenCalledWith({
        where: { id_subtarea: '1' },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });

    it('debería lanzar NotFoundException cuando la subtarea no existe', async () => {
      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(prismaService.subtarea.delete).toHaveBeenCalledWith({
        where: { id_subtarea: '999' },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });
  });
});
