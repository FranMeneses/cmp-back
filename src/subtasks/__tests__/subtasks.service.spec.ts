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
                  const updatedSubtask = { ...mockSubtask };
                  if (data.nombre) updatedSubtask.nombre = data.nombre;
                  if (data.descripcion) updatedSubtask.descripcion = data.descripcion;
                  if (data.presupuesto) updatedSubtask.presupuesto = data.presupuesto;
                  return Promise.resolve(updatedSubtask);
                }
                if (where.id_subtarea === '2') {
                  const updatedSubtask = { ...mockSubtask2 };
                  if (data.nombre) updatedSubtask.nombre = data.nombre;
                  if (data.descripcion) updatedSubtask.descripcion = data.descripcion;
                  if (data.presupuesto) updatedSubtask.presupuesto = data.presupuesto;
                  return Promise.resolve(updatedSubtask);
                }
                return Promise.reject(new NotFoundException(`Subtarea con ID ${where.id_subtarea} no encontrada`));
              }),
              delete: jest.fn().mockImplementation(({ where }) => {
                if (where.id_subtarea === '1') {
                  return Promise.resolve(mockSubtask);
                }
                if (where.id_subtarea === '2') {
                  return Promise.resolve(mockSubtask2);
                }
                return Promise.reject(new NotFoundException(`Subtarea con ID ${where.id_subtarea} no encontrada`));
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

    it('debería validar campos requeridos', async () => {
      const createSubtaskDto = {
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
      };

      try {
        await service.create(createSubtaskDto as any);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('debería validar tipos de datos', async () => {
      const createSubtaskDto = {
        taskId: '1',
        number: '1',
        name: 'Test Subtask',
        description: 'Test Description',
        budget: '1000',
        expense: '500',
      };

      try {
        await service.create(createSubtaskDto as any);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('debería validar fechas inválidas', async () => {
      const createSubtaskDto = {
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
        startDate: new Date('invalid-date'),
        endDate: new Date('2024-01-31'),
      };

      try {
        await service.create(createSubtaskDto);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('debería validar que el gasto no exceda el presupuesto', async () => {
      const createSubtaskDto = {
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
        budget: 1000,
        expense: 2000,
      };

      try {
        await service.create(createSubtaskDto);
        throw new Error('Debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
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

    it('debería retornar array vacío cuando no hay subtareas', async () => {
      prismaService.subtarea.findMany = jest.fn().mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('debería manejar correctamente la paginación', async () => {
      const mockSubtasks = Array(20).fill(null).map((_, i) => ({
        ...mockSubtask,
        id_subtarea: (i + 1).toString(),
        numero: i + 1
      }));

      prismaService.subtarea.findMany = jest.fn().mockResolvedValue(mockSubtasks);
      const result = await service.findAll();
      expect(result).toHaveLength(20);
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
      try {
        await service.findOne('999');
        throw new Error('Debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Subtarea con ID 999 no encontrada');
      }
      expect(prismaService.subtarea.findUnique).toHaveBeenCalledWith({
        where: { id_subtarea: '999' },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });

    it('debería manejar IDs inválidos', async () => {
      try {
        await service.findOne('invalid-id');
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
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

      try {
        await service.update('999', updateSubtaskDto);
        fail('Debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Subtarea con ID 999 no encontrada');
      }
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

    it('debería validar fechas coherentes', async () => {
      const updateSubtaskDto = {
        startDate: new Date('2024-01-31'),
        endDate: new Date('2024-01-01'),
      };

      try {
        await service.update('1', updateSubtaskDto);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('La fecha de inicio debe ser anterior a la fecha de término');
      }
    });

    it('debería manejar actualización con campos vacíos', async () => {
      const updateSubtaskDto = {
        name: '',
        description: '   ',
      };

      try {
        await service.update('1', updateSubtaskDto);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('debería manejar caracteres especiales', async () => {
      const updateSubtaskDto = {
        name: 'Test @#$%^&*()',
        description: 'Descripción con ñ y áéíóú',
      };

      const result = await service.update('1', updateSubtaskDto);
      expect(result.name).toBe('Test @#$%^&*()');
      expect(result.description).toBe('Descripción con ñ y áéíóú');
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
      try {
        await service.remove('999');
        fail('Debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Subtarea con ID 999 no encontrada');
      }
      expect(prismaService.subtarea.delete).toHaveBeenCalledWith({
        where: { id_subtarea: '999' },
        include: {
          subtarea_estado: true,
          prioridad: true
        }
      });
    });

    it('debería validar dependencias antes de eliminar', async () => {
      prismaService.subtarea.delete = jest.fn().mockRejectedValue(
        new Error('No se puede eliminar la subtarea porque tiene dependencias')
      );

      try {
        await service.remove('1');
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('dependencias');
      }
    });
  });
});
