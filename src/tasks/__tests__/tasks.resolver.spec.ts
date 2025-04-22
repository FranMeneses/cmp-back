import { Test, TestingModule } from '@nestjs/testing';
import { TasksResolver } from '../tasks.resolver';
import { TasksService } from '../tasks.service';
import { Task, CreateTaskInput, UpdateTaskInput } from '../../graphql/graphql.types';

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
            getTaskProgress: jest.fn().mockResolvedValue({
              progress: 50,
              totalSubtasks: 2,
              completedSubtasks: 1,
              subtasksProgress: [
                { id: '1', name: 'Subtask 1', status: 'In Progress', percentage: 50 },
                { id: '2', name: 'Subtask 2', status: 'Completed', percentage: 100 }
              ]
            }),
            getTaskSubtasks: jest.fn().mockResolvedValue([]),
            getTotalBudget: jest.fn().mockResolvedValue({
              taskId: '1',
              taskName: 'Test Task',
              totalBudget: 1000,
              subtasksCount: 2,
              subtasks: [
                { id: '1', name: 'Subtask 1', budget: 500 },
                { id: '2', name: 'Subtask 2', budget: 500 }
              ]
            }),
            getTotalExpense: jest.fn().mockResolvedValue({
              taskId: '1',
              taskName: 'Test Task',
              totalExpense: 500,
              subtasksCount: 2,
              subtasks: [
                { id: '1', name: 'Subtask 1', expense: 250 },
                { id: '2', name: 'Subtask 2', expense: 250 }
              ]
            }),
          },
        },
      ],
    }).compile();

    resolver = module.get<TasksResolver>(TasksResolver);
    service = module.get<TasksService>(TasksService);
  });

  it('debería estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('tasks', () => {
    it('debería retornar un array de tareas', async () => {
      const result = await resolver.tasks();
      expect(result).toEqual([mockTask]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('task', () => {
    it('debería retornar una única tarea', async () => {
      const result = await resolver.task('1');
      expect(result).toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('createTask', () => {
    it('debería crear una nueva tarea', async () => {
      const createInput: CreateTaskInput = {
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
    it('debería actualizar una tarea', async () => {
      const updateInput: UpdateTaskInput = {
        name: 'Updated Task',
      };
      const result = await resolver.updateTask('1', updateInput);
      expect(result).toEqual(mockTask);
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });
  });

  describe('deleteTask', () => {
    it('debería eliminar una tarea', async () => {
      const result = await resolver.deleteTask('1');
      expect(result).toEqual(mockTask);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('taskProgress', () => {
    it('debería retornar el progreso de la tarea', async () => {
      const result = await resolver.taskProgress('1');
      expect(result).toEqual({
        progress: 50,
        totalSubtasks: 2,
        completedSubtasks: 1,
        subtasksProgress: [
          { id: '1', name: 'Subtask 1', status: 'In Progress', percentage: 50 },
          { id: '2', name: 'Subtask 2', status: 'Completed', percentage: 100 }
        ]
      });
      expect(service.getTaskProgress).toHaveBeenCalledWith('1');
    });
  });

  describe('taskSubtasks', () => {
    it('debería retornar las subtareas de la tarea', async () => {
      const result = await resolver.taskSubtasks('1');
      expect(result).toEqual([]);
      expect(service.getTaskSubtasks).toHaveBeenCalledWith('1');
    });
  });

  describe('taskTotalBudget', () => {
    it('debería retornar el presupuesto total de la tarea', async () => {
      const result = await resolver.taskTotalBudget('1');
      expect(result).toEqual({
        taskId: '1',
        taskName: 'Test Task',
        totalBudget: 1000,
        subtasksCount: 2,
        subtasks: [
          { id: '1', name: 'Subtask 1', budget: 500 },
          { id: '2', name: 'Subtask 2', budget: 500 }
        ]
      });
      expect(service.getTotalBudget).toHaveBeenCalledWith('1');
    });
  });

  describe('taskTotalExpense', () => {
    it('debería retornar el gasto total de la tarea', async () => {
      const result = await resolver.taskTotalExpense('1');
      expect(result).toEqual({
        taskId: '1',
        taskName: 'Test Task',
        totalExpense: 500,
        subtasksCount: 2,
        subtasks: [
          { id: '1', name: 'Subtask 1', expense: 250 },
          { id: '2', name: 'Subtask 2', expense: 250 }
        ]
      });
      expect(service.getTotalExpense).toHaveBeenCalledWith('1');
    });
  });
}); 