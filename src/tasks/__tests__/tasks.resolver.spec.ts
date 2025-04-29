import { Test, TestingModule } from '@nestjs/testing';
import { TasksResolver } from '../tasks.resolver';
import { TasksService } from '../tasks.service';
import { Task, Valley, Faena, TaskStatus } from '../../graphql/graphql.types';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

describe('TasksResolver', () => {
  let resolver: TasksResolver;
  let service: TasksService;

  const mockValley: Valley = {
    id: 1,
    name: 'Test Valley'
  };

  const mockFaena: Faena = {
    id: 1,
    name: 'Test Faena'
  };

  const mockStatus: TaskStatus = {
    id: 1,
    name: 'Test Status'
  };

  const mockTask: Task = {
    id: '1',
    name: 'Test Task',
    description: 'Test Description',
    valleyId: 1,
    faenaId: 1,
    statusId: 1,
    valley: mockValley,
    faena: mockFaena,
    status: mockStatus
  };

  const mockTask2: Task = {
    id: '2',
    name: 'Test Task 2',
    description: 'Test Description 2',
    valleyId: 2,
    faenaId: 2,
    statusId: 2,
    valley: { ...mockValley, id: 2 },
    faena: { ...mockFaena, id: 2 },
    status: { ...mockStatus, id: 2 }
  };

  const mockGeneratedId = 'generated-id';

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn().mockResolvedValue([mockTask, mockTask2]),

      findOne: jest.fn((id) => {
        if (id === '1') return Promise.resolve(mockTask);
        if (id === '2') return Promise.resolve(mockTask2);
        return Promise.reject(new NotFoundException(`Tarea con ID ${id} no encontrada`));
      }),

      create: jest.fn((dto: CreateTaskDto) => {
        if (!dto.description) {
          return Promise.reject(new BadRequestException('El campo descripción es requerido'));
        }
        if (typeof dto.valleyId !== 'number' || typeof dto.faenaId !== 'number' || typeof dto.statusId !== 'number') {
          return Promise.reject(new BadRequestException('Los campos valleyId, faenaId y statusId deben ser números'));
        }
        return Promise.resolve({
          id: mockGeneratedId,
          name: dto.name,
          description: dto.description,
          valleyId: dto.valleyId,
          faenaId: dto.faenaId,
          statusId: dto.statusId,
          valley: mockValley,
          faena: mockFaena,
          status: mockStatus,
        });
      }),

      update: jest.fn((id: string, dto: UpdateTaskDto) => {
        if (id !== '1' && id !== '2') {
          return Promise.reject(new NotFoundException(`Tarea con ID ${id} no encontrada`));
        }
        if (dto.valleyId && typeof dto.valleyId !== 'number') {
          return Promise.reject(new BadRequestException('valleyId debe ser un número'));
        }
        if (dto.faenaId && typeof dto.faenaId !== 'number') {
          return Promise.reject(new BadRequestException('faenaId debe ser un número'));
        }
        if (dto.statusId && typeof dto.statusId !== 'number') {
          return Promise.reject(new BadRequestException('statusId debe ser un número'));
        }
        const task = id === '1' ? mockTask : mockTask2;
        return Promise.resolve({
          ...task,
          ...dto
        });
      }),

      remove: jest.fn((id: string) => {
        if (id !== '1' && id !== '2') {
          return Promise.reject(new NotFoundException(`Tarea con ID ${id} no encontrada`));
        }
        return Promise.resolve(id === '1' ? mockTask : mockTask2);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksResolver,
        {
          provide: TasksService,
          useValue: mockService
        },
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
              enableImplicitConversion: true
            }
          })
        }
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
      expect(service.findAll).toHaveBeenCalled();
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
      const createInput: CreateTaskDto = {
        name: 'Test Task',
        description: 'Test Description',
        valleyId: 1,
        faenaId: 1,
        statusId: 1
      };
      const result = await resolver.createTask(createInput);
      expect(result).toEqual({
        id: mockGeneratedId,
        name: 'Test Task',
        description: 'Test Description',
        valleyId: 1,
        faenaId: 1,
        statusId: 1,
        valley: mockValley,
        faena: mockFaena,
        status: mockStatus
      });
      expect(service.create).toHaveBeenCalledWith(createInput);
    });

    it('debería validar campos requeridos', async () => {
      const createInput = {
        name: 'Test Task',
        // Falta description que es requerido
        valleyId: 1,
        faenaId: 1,
        statusId: 1
      };
      
      await expect(resolver.createTask(createInput as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debería validar tipos de datos', async () => {
      const createInput = {
        name: 'Test Task',
        description: 'Test Description',
        valleyId: '1', // Debería ser número
        faenaId: '1', // Debería ser número
        statusId: '1' // Debería ser número
      };
      
      await expect(resolver.createTask(createInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTask', () => {
    it('debería actualizar una tarea', async () => {
      const updateInput: UpdateTaskDto = {
        name: 'Updated Task'
      };
      const result = await resolver.updateTask('1', updateInput);
      expect(result).toEqual({
        ...mockTask,
        name: 'Updated Task'
      });
      expect(service.update).toHaveBeenCalledWith('1', updateInput);
    });

    it('debería manejar actualización de tarea inexistente', async () => {
      const updateInput: UpdateTaskDto = {
        name: 'Updated Task'
      };
      await expect(resolver.updateTask('999', updateInput))
        .rejects.toThrow(NotFoundException);
    });

    it('debería validar tipos de datos en la actualización', async () => {
      const updateInput = {
        name: 'Updated Task',
        valleyId: '1', // Debería ser número
        faenaId: '1', // Debería ser número
        statusId: '1' // Debería ser número
      };
      
      await expect(resolver.updateTask('1', updateInput as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('removeTask', () => {
    it('debería eliminar una tarea', async () => {
      const result = await resolver.removeTask('1');
      expect(result).toEqual(mockTask);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('debería manejar eliminación de tarea inexistente', async () => {
      await expect(resolver.removeTask('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 