import { Test, TestingModule } from '@nestjs/testing';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';
import { Task } from '../graphql/graphql.types';

describe('TasksResolver', () => {
  let resolver: TasksResolver;
  let service: TasksService;

  const mockTask: Task = {
    id: '1',
    name: 'Test Task',
    description: 'Test Description',
    budget: 1000,
    expense: 500,
    startDate: new Date(),
    endDate: new Date(),
    finalDate: new Date(),
    status: 1,
    priority: 1,
    valley: 1,
    faena: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksResolver,
        {
          provide: TasksService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockTask]),
            findOne: jest.fn().mockResolvedValue(mockTask),
            create: jest.fn().mockResolvedValue(mockTask),
            update: jest.fn().mockResolvedValue(mockTask),
            remove: jest.fn().mockResolvedValue(mockTask),
            getTaskProgress: jest.fn().mockResolvedValue(50),
            getTaskSubtasks: jest.fn().mockResolvedValue([]),
            getTotalBudget: jest.fn().mockResolvedValue(1000),
            getTotalExpense: jest.fn().mockResolvedValue(500),
          },
        },
      ],
    }).compile();

    resolver = module.get<TasksResolver>(TasksResolver);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('tasks', () => {
    it('should return an array of tasks', async () => {
      const result = await resolver.tasks();
      expect(result).toEqual([mockTask]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('task', () => {
    it('should return a single task', async () => {
      const result = await resolver.task('1');
      expect(result).toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const createInput = {
        name: 'Test Task',
        description: 'Test Description',
        budget: 1000,
        expense: 500,
        startDate: new Date(),
        endDate: new Date(),
        finalDate: new Date(),
        status: 1,
        priority: 1,
        valley: 1,
        faena: 1,
      };
      const result = await resolver.createTask(createInput);
      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(createInput);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updateInput = {
        name: 'Updated Task',
      };
      const result = await resolver.updateTask('1', updateInput);
      expect(result).toEqual(mockTask);
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const result = await resolver.deleteTask('1');
      expect(result).toEqual(mockTask);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('taskProgress', () => {
    it('should return task progress', async () => {
      const result = await resolver.taskProgress('1');
      expect(result).toEqual(50);
      expect(service.getTaskProgress).toHaveBeenCalledWith('1');
    });
  });

  describe('taskSubtasks', () => {
    it('should return task subtasks', async () => {
      const result = await resolver.taskSubtasks('1');
      expect(result).toEqual([]);
      expect(service.getTaskSubtasks).toHaveBeenCalledWith('1');
    });
  });

  describe('taskTotalBudget', () => {
    it('should return total budget', async () => {
      const result = await resolver.taskTotalBudget('1');
      expect(result).toEqual(1000);
      expect(service.getTotalBudget).toHaveBeenCalledWith('1');
    });
  });

  describe('taskTotalExpense', () => {
    it('should return total expense', async () => {
      const result = await resolver.taskTotalExpense('1');
      expect(result).toEqual(500);
      expect(service.getTotalExpense).toHaveBeenCalledWith('1');
    });
  });
}); 