import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksResolver } from '../subtasks.resolver';
import { SubtasksService } from '../subtasks.service';
import { Subtask, CreateSubtaskInput, UpdateSubtaskInput } from '../../graphql/graphql.types';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksResolver,
        {
          provide: SubtasksService,
          useValue: {
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
            create: jest.fn().mockResolvedValue(mockSubtask),
            update: jest.fn().mockResolvedValue(mockSubtask),
            remove: jest.fn().mockResolvedValue(mockSubtask),
          },
        },
      ],
    }).compile();

    resolver = module.get<SubtasksResolver>(SubtasksResolver);
    service = module.get<SubtasksService>(SubtasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
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
        .rejects.toThrow('Unexpected token \'i\', "invalid-json" is not valid JSON');
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
      const createInput: CreateSubtaskInput = {
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
      const result = await resolver.createSubtask(createInput);
      expect(result).toEqual(mockSubtask);
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
        startDate: new Date(),
        endDate: new Date(),
        finalDate: new Date(),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
      };
      
      jest.spyOn(service, 'create').mockRejectedValueOnce(
        new BadRequestException('Campos requeridos faltantes')
      );
      
      await expect(resolver.createSubtask(createInput as any))
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
        startDate: new Date(),
        endDate: new Date(),
        finalDate: new Date(),
        beneficiaryId: '1',
        statusId: 1,
        priorityId: 1,
      };
      
      jest.spyOn(service, 'create').mockRejectedValueOnce(
        new BadRequestException('Tipos de datos inválidos')
      );
      
      await expect(resolver.createSubtask(createInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSubtask', () => {
    it('debería actualizar una subtarea', async () => {
      const updateInput: UpdateSubtaskInput = {
        name: 'Updated Subtask',
      };
      const result = await resolver.updateSubtask('1', updateInput);
      expect(result).toEqual(mockSubtask);
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });

    it('debería manejar actualización de subtarea inexistente', async () => {
      const updateInput: UpdateSubtaskInput = {
        name: 'Updated Subtask',
      };
      jest.spyOn(service, 'update').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.updateSubtask('999', updateInput))
        .rejects.toThrow(NotFoundException);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        budget: '1000', // Debería ser número
        expense: '500', // Debería ser número
      };
      
      jest.spyOn(service, 'update').mockRejectedValueOnce(
        new BadRequestException('Tipos de datos inválidos')
      );
      
      await expect(resolver.updateSubtask('1', updateInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteSubtask', () => {
    it('debería eliminar una subtarea', async () => {
      const result = await resolver.deleteSubtask('1');
      expect(result).toEqual(mockSubtask);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de subtarea inexistente', async () => {
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.deleteSubtask('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 