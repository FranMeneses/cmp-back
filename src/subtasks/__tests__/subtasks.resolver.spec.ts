import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksResolver } from '../subtasks.resolver';
import { SubtasksService } from '../subtasks.service';
import { Subtask } from '../../graphql/graphql.types';
import { CreateSubtaskDto } from '../dto/create-subtask.dto';
import { UpdateSubtaskDto } from '../dto/update-subtask.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

describe('SubtasksResolver', () => {
  let resolver: SubtasksResolver;
  let service: SubtasksService;
  let mockService: jest.Mocked<SubtasksService>;

  const mockSubtask: Subtask = {
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
  };

  const mockSubtask2: Subtask = {
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
  };

  beforeEach(async () => {
    mockService = {
      findAll: jest.fn().mockImplementation((query) => {
        if (!query || Object.keys(query).length === 0) {
          return [mockSubtask, mockSubtask2];
        }
        if (query.taskId === '1') {
          return [mockSubtask, mockSubtask2];
        }
        if (query.statusId === 1) {
          return [mockSubtask];
        }
        if (query.statusId === 2) {
          return [mockSubtask2];
        }
        return [];
      }),
      findOne: jest.fn((id) => {
        if (id === '1') return Promise.resolve(mockSubtask);
        if (id === '2') return Promise.resolve(mockSubtask2);
        return Promise.reject(new NotFoundException(`Subtarea con ID ${id} no encontrada`));
      }),
      create: jest.fn((input: CreateSubtaskDto) => {
        if (!input.description) {
          return Promise.reject(new BadRequestException('El campo description es requerido'));
        }
        if (typeof input.taskId !== 'string' || typeof input.number !== 'number' || typeof input.statusId !== 'number') {
          return Promise.reject(new BadRequestException('Los campos taskId, number y statusId deben ser del tipo correcto'));
        }
        return Promise.resolve({
          id: 'mockGeneratedId',
          taskId: input.taskId,
          number: input.number,
          name: input.name,
          description: input.description,
          budget: input.budget || 0,
          expense: input.expense || 0,
          startDate: input.startDate || new Date('2024-01-01'),
          endDate: input.endDate || new Date('2024-01-31'),
          finalDate: input.finalDate || new Date('2024-01-31'),
          beneficiaryId: input.beneficiaryId,
          statusId: input.statusId || 1,
          priorityId: input.priorityId,
        });
      }),
      update: jest.fn((id: string, input: UpdateSubtaskDto) => {
        if (id !== '1' && id !== '2') {
          return Promise.reject(new NotFoundException(`Subtarea con ID ${id} no encontrada`));
        }
        if (input.number && typeof input.number !== 'number') {
          return Promise.reject(new BadRequestException('number debe ser un número'));
        }
        if (input.statusId && typeof input.statusId !== 'number') {
          return Promise.reject(new BadRequestException('statusId debe ser un número'));
        }
        if (input.priorityId && typeof input.priorityId !== 'number') {
          return Promise.reject(new BadRequestException('priorityId debe ser un número'));
        }
        if (input.budget && typeof input.budget !== 'number') {
          return Promise.reject(new BadRequestException('budget debe ser un número'));
        }
        if (input.expense && typeof input.expense !== 'number') {
          return Promise.reject(new BadRequestException('expense debe ser un número'));
        }
        const baseSubtask = id === '1' ? mockSubtask : mockSubtask2;
        return Promise.resolve({
          ...baseSubtask,
          ...input
        });
      }),
      remove: jest.fn((id: string) => {
        if (id !== '1' && id !== '2') {
          return Promise.reject(new NotFoundException(`Subtarea con ID ${id} no encontrada`));
        }
        return Promise.resolve(id === '1' ? mockSubtask : mockSubtask2);
      }),
    } as unknown as jest.Mocked<SubtasksService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksResolver,
        {
          provide: SubtasksService,
          useValue: mockService,
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    }).compile();

    resolver = module.get<SubtasksResolver>(SubtasksResolver);
    service = module.get<SubtasksService>(SubtasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('subtasks', () => {
    it('debería retornar un array de subtareas sin filtros', async () => {
      const result = await resolver.subtasks();
      expect(result).toEqual([mockSubtask, mockSubtask2]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('debería retornar subtareas filtradas por taskId', async () => {
      const result = await resolver.subtasks();
      expect(result).toEqual([mockSubtask, mockSubtask2]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('debería retornar subtareas filtradas por statusId', async () => {
      const result = await resolver.subtasks();
      expect(result).toEqual([mockSubtask, mockSubtask2]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('debería retornar array vacío cuando no hay coincidencias', async () => {
      const result = await resolver.subtasks();
      expect(result).toEqual([mockSubtask, mockSubtask2]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('subtask', () => {
    it('debería retornar una única subtarea', async () => {
      const result = await resolver.subtask('1');
      expect(result).toEqual(mockSubtask);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('debería lanzar NotFoundException cuando la subtarea no existe', async () => {
      await expect(resolver.subtask('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('createSubtask', () => {
    it('debería crear una nueva subtarea', async () => {
      const createInput: CreateSubtaskDto = {
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
        beneficiaryId: '1',
        priorityId: 1,
        statusId: 1,
      };

      const result = await resolver.createSubtask(createInput);
      expect(result).toEqual({
        id: 'mockGeneratedId',
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        description: 'Test Description',
        budget: 0,
        expense: 0,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        finalDate: new Date('2024-01-31'),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
      });
      expect(service.create).toHaveBeenCalledWith(createInput);
    });

    it('debería validar campos requeridos', async () => {
      const createInput = {
        taskId: '1',
        number: 1,
        name: 'Test Subtask',
        // Falta description que es requerido
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        finalDate: new Date('2024-01-31'),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
      };
      
      await expect(resolver.createSubtask(createInput as unknown as CreateSubtaskDto))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos', async () => {
      const createInput = {
        taskId: '1',
        number: '1', // Debería ser número
        name: 'Test Subtask',
        description: 'Test Description',
        budget: '1000', // Debería ser número
        expense: '500', // Debería ser número
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        finalDate: new Date('2024-01-31'),
        beneficiaryId: '1',
        statusId: '1', // Debería ser número
        priorityId: '1', // Debería ser número
      };
      
      await expect(resolver.createSubtask(createInput as unknown as CreateSubtaskDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSubtask', () => {
    it('debería actualizar una subtarea', async () => {
      const updateInput: UpdateSubtaskDto = {
        name: 'Updated Subtask',
        beneficiaryId: '2',
      };

      const result = await resolver.updateSubtask('1', updateInput);
      expect(result).toEqual({
        ...mockSubtask,
        name: 'Updated Subtask',
        beneficiaryId: '2',
      });
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });

    it('debería lanzar NotFoundException si la subtarea no existe', async () => {
      const updateInput: UpdateSubtaskDto = {
        name: 'Updated Subtask',
      };
      const result = resolver.updateSubtask('999', updateInput);
      await expect(result).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('999', updateInput);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        budget: '1000', // Debería ser número
        expense: '500', // Debería ser número
      };
      
      await expect(resolver.updateSubtask('1', updateInput as unknown as UpdateSubtaskDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('removeSubtask', () => {
    it('debería eliminar una subtarea', async () => {
      const result = await resolver.removeSubtask('1');
      expect(result).toEqual(mockSubtask);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de subtarea inexistente', async () => {
      await expect(resolver.removeSubtask('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 