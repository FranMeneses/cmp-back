import { Test, TestingModule } from '@nestjs/testing';
import { TasksResolver } from '../tasks.resolver';
import { TasksService } from '../tasks.service';
import { Task, CreateTaskInput, UpdateTaskInput } from '../../graphql/graphql.types';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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

  const mockTask2: Task = {
    id: '2',
    name: 'Test Task 2',
    description: 'Test Description 2',
    budget: 2000,
    expense: 1000,
    startDate: new Date(),
    endDate: new Date(),
    finalDate: new Date(),
    status: 2,
    priority: 2,
    valley: 2,
    faena: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksResolver,
        {
          provide: TasksService,
          useValue: {
            findAll: jest.fn().mockImplementation((query) => {
              if (!query || Object.keys(query).length === 0) {
                return [mockTask, mockTask2];
              }
              if (query.status === 1) {
                return [mockTask];
              }
              if (query.status === 2) {
                return [mockTask2];
              }
              return [];
            }),
            findOne: jest.fn().mockImplementation((id) => {
              if (id === '1') return mockTask;
              if (id === '2') return mockTask2;
              throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
            }),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('tasks', () => {
    it('debería retornar un array de tareas', async () => {
      const result = await resolver.tasks();
      expect(result).toEqual([mockTask, mockTask2]);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('debería retornar tareas filtradas por status', async () => {
      const query = JSON.stringify({ status: 1 });
      const result = await resolver.tasks(query);
      expect(result).toEqual([mockTask]);
      expect(service.findAll).toHaveBeenCalledWith({ status: 1 });
    });

    it('debería manejar query inválida', async () => {
      const query = 'invalid-json';
      await expect(resolver.tasks(query))
        .rejects.toThrow('Unexpected token \'i\', "invalid-json" is not valid JSON');
    });
  });

  describe('task', () => {
    it('debería retornar una única tarea', async () => {
      const result = await resolver.task('1');
      expect(result).toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('debería lanzar NotFoundException cuando la tarea no existe', async () => {
      await expect(resolver.task('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
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

    it('debería validar campos requeridos', async () => {
      const createInput = {
        name: 'Test Task',
        // Falta description que es requerido
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
      
      jest.spyOn(service, 'create').mockRejectedValueOnce(
        new BadRequestException('Campos requeridos faltantes')
      );
      
      await expect(resolver.createTask(createInput as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos', async () => {
      const createInput = {
        name: 'Test Task',
        description: 'Test Description',
        budget: '1000', // Debería ser número
        expense: '500', // Debería ser número
        startDate: new Date(),
        endDate: new Date(),
        finalDate: new Date(),
        status: '1', // Debería ser número
        priority: '1', // Debería ser número
        valley: '1', // Debería ser número
        faena: '1', // Debería ser número
      };
      
      jest.spyOn(service, 'create').mockRejectedValueOnce(
        new BadRequestException('Tipos de datos inválidos')
      );
      
      await expect(resolver.createTask(createInput as any))
        .rejects.toThrow(BadRequestException);
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

    it('debería manejar actualización de tarea inexistente', async () => {
      const updateInput: UpdateTaskInput = {
        name: 'Updated Task',
      };
      jest.spyOn(service, 'update').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.updateTask('999', updateInput))
        .rejects.toThrow(NotFoundException);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        name: 'Updated Task',
        budget: '1000', // Debería ser número
        expense: '500', // Debería ser número
        status: '1', // Debería ser número
        priority: '1', // Debería ser número
        valley: '1', // Debería ser número
        faena: '1', // Debería ser número
      };
      
      jest.spyOn(service, 'update').mockRejectedValueOnce(
        new BadRequestException('Tipos de datos inválidos')
      );
      
      await expect(resolver.updateTask('1', updateInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteTask', () => {
    it('debería eliminar una tarea', async () => {
      const result = await resolver.deleteTask('1');
      expect(result).toEqual(mockTask);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de tarea inexistente', async () => {
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.deleteTask('999'))
        .rejects.toThrow(NotFoundException);
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

    it('debería manejar tarea sin subtareas', async () => {
      jest.spyOn(service, 'getTaskProgress').mockResolvedValueOnce({
        progress: 0,
        totalSubtasks: 0,
        completedSubtasks: 0,
        subtasksProgress: []
      });
      const result = await resolver.taskProgress('1');
      expect(result.progress).toBe(0);
      expect(result.totalSubtasks).toBe(0);
    });
  });

  describe('taskSubtasks', () => {
    it('debería retornar las subtareas de la tarea', async () => {
      const result = await resolver.taskSubtasks('1');
      expect(result).toEqual([]);
      expect(service.getTaskSubtasks).toHaveBeenCalledWith('1');
    });

    it('debería manejar tarea sin subtareas', async () => {
      jest.spyOn(service, 'getTaskSubtasks').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.taskSubtasks('1'))
        .rejects.toThrow(NotFoundException);
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

    it('debería manejar tarea sin presupuesto', async () => {
      jest.spyOn(service, 'getTotalBudget').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.taskTotalBudget('1'))
        .rejects.toThrow(NotFoundException);
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

    it('debería manejar tarea sin gastos', async () => {
      jest.spyOn(service, 'getTotalExpense').mockRejectedValueOnce(new NotFoundException());
      await expect(resolver.taskTotalExpense('1'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 