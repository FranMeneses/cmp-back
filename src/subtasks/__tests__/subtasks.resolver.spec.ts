import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksResolver } from '../subtasks.resolver';
import { SubtasksService } from '../subtasks.service';
import { Subtask, CreateSubtaskInput, UpdateSubtaskInput } from '../../graphql/graphql.types';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksResolver,
        {
          provide: SubtasksService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockSubtask]),
            findOne: jest.fn().mockResolvedValue(mockSubtask),
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

  it('debería estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('subtasks', () => {
    it('debería retornar un array de subtareas', async () => {
      const result = await resolver.subtasks();
      expect(result).toEqual([mockSubtask]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('subtask', () => {
    it('debería retornar una única subtarea', async () => {
      const result = await resolver.subtask('1');
      expect(result).toEqual(mockSubtask);
      expect(service.findOne).toHaveBeenCalledWith('1');
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
  });

  describe('deleteSubtask', () => {
    it('debería eliminar una subtarea', async () => {
      const result = await resolver.deleteSubtask('1');
      expect(result).toEqual(mockSubtask);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
}); 