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

  const mockSubtask: Subtask = {
    id: '1',
    taskId: '1',
    number: 1,
    name: 'Test Subtask',
    description: 'Test Description',
    budget: 1000,
    expense: 500,
    startDate: new Date(),
    endDate: new Date(),
    finalDate: new Date(),
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
    startDate: new Date(),
    endDate: new Date(),
    finalDate: new Date(),
    beneficiaryId: '2',
    statusId: 2,
    priorityId: 2,
  };

  const mockService = {
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
    findOne: jest.fn().mockImplementation((id) => {
      if (id === '1') return mockSubtask;
      if (id === '2') return mockSubtask2;
      throw new NotFoundException(`Subtarea con ID ${id} no encontrada`);
    }),
    create: jest.fn().mockImplementation((input: CreateSubtaskDto) => {
      const generatedId = 'mockGeneratedId';
      return {
        id: generatedId,
        taskId: input.id_tarea,
        number: input.numero,
        name: input.nombre,
        description: input.descripcion,
        budget: input.presupuesto || 0,
        expense: input.gasto || 0,
        startDate: input.fecha_inicio || new Date(),
        endDate: input.fecha_termino || new Date(),
        finalDate: input.fecha_final || new Date(),
        beneficiaryId: String(input.id_beneficiario),
        statusId: input.id_estado || 1,
        priorityId: input.id_prioridad,
      };
    }),
    update: jest.fn().mockImplementation((id: string, input: UpdateSubtaskDto) => {
      if (id !== '1' && id !== '2') {
        throw new NotFoundException(`Subtarea con ID ${id} no encontrada`);
      }
      const baseSubtask = id === '1' ? mockSubtask : mockSubtask2;
      return {
        ...baseSubtask,
        taskId: input.id_tarea ? String(input.id_tarea) : baseSubtask.taskId,
        name: input.nombre || baseSubtask.name,
        description: input.descripcion || baseSubtask.description,
        budget: input.presupuesto || baseSubtask.budget,
        expense: input.gasto || baseSubtask.expense,
        startDate: input.fecha_inicio || baseSubtask.startDate,
        endDate: input.fecha_termino || baseSubtask.endDate,
        finalDate: input.fecha_final || baseSubtask.finalDate,
        beneficiaryId: input.id_beneficiario ? String(input.id_beneficiario) : baseSubtask.beneficiaryId,
        statusId: input.id_estado || baseSubtask.statusId,
        priorityId: input.id_prioridad || baseSubtask.priorityId,
      };
    }),
    remove: jest.fn().mockImplementation((id: string) => {
      if (id !== '1' && id !== '2') {
        throw new NotFoundException(`Subtarea con ID ${id} no encontrada`);
      }
      return id === '1' ? mockSubtask : mockSubtask2;
    }),
  };

  beforeEach(async () => {
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
    it('debería retornar un array de subtareas', async () => {
      const result = await resolver.subtasks();
      expect(result).toEqual([mockSubtask, mockSubtask2]);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('debería retornar subtareas filtradas por taskId', async () => {
      const query = JSON.stringify({ taskId: '1' });
      const result = await resolver.subtasks(query);
      expect(result).toEqual([mockSubtask, mockSubtask2]);
      expect(service.findAll).toHaveBeenCalledWith({ taskId: '1' });
    });

    it('debería retornar subtareas filtradas por statusId', async () => {
      const query = JSON.stringify({ statusId: 1 });
      const result = await resolver.subtasks(query);
      expect(result).toEqual([mockSubtask]);
      expect(service.findAll).toHaveBeenCalledWith({ statusId: 1 });
    });

    it('debería manejar query inválida', async () => {
      const query = 'invalid-json';
      await expect(resolver.subtasks(query))
        .rejects.toThrow('Query inválida');
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
    it('debería crear una subtarea y transformar snake_case a camelCase', async () => {
      const createInput: CreateSubtaskDto = {
        id_tarea: '1',
        numero: 1,
        nombre: 'Test Subtask',
        descripcion: 'Test Description',
        id_beneficiario: 1,
        id_prioridad: 1,
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
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        finalDate: expect.any(Date),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
      });
      expect(service.create).toHaveBeenCalledWith(createInput);
    });

    it('debería validar campos requeridos', async () => {
      const createInput = {
        id_tarea: '1',
        numero: 1,
        nombre: 'Test Subtask',
        // Falta descripcion que es requerido
        presupuesto: 1000,
        gasto: 500,
        fecha_inicio: new Date(),
        fecha_termino: new Date(),
        fecha_final: new Date(),
        id_beneficiario: 1,
        id_estado: 1,
        id_prioridad: 1,
      };
      
      await expect(resolver.createSubtask(createInput as unknown as CreateSubtaskDto))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos', async () => {
      const createInput = {
        id_tarea: '1',
        numero: '1', // Debería ser número
        nombre: 'Test Subtask',
        descripcion: 'Test Description',
        presupuesto: '1000', // Debería ser número
        gasto: '500', // Debería ser número
        fecha_inicio: new Date(),
        fecha_termino: new Date(),
        fecha_final: new Date(),
        id_beneficiario: '1', // Debería ser número
        id_estado: 1,
        id_prioridad: 1,
      };
      
      await expect(resolver.createSubtask(createInput as unknown as CreateSubtaskDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSubtask', () => {
    it('debería actualizar una subtarea y transformar snake_case a camelCase', async () => {
      const updateInput: UpdateSubtaskDto = {
        nombre: 'Updated Subtask',
        id_beneficiario: 2,
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
        nombre: 'Updated Subtask',
      };
      const result = resolver.updateSubtask('999', updateInput);
      await expect(result).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('999', updateInput);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        presupuesto: '1000', // Debería ser número
        gasto: '500', // Debería ser número
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