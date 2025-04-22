import { CreateTaskDto } from '../create-task.dto';
import { UpdateTaskDto } from '../update-task.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('Task DTOs', () => {
  describe('CreateTaskDto', () => {
    it('debería validar un DTO válido', async () => {
      const dto = plainToClass(CreateTaskDto, {
        name: 'Tarea 1',
        description: 'Descripción de la tarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        status: 1,
        priority: 1,
        valley: 1,
        faena: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si falta name', async () => {
      const dto = plainToClass(CreateTaskDto, {
        description: 'Descripción de la tarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        status: 1,
        priority: 1,
        valley: 1,
        faena: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si name no es un string', async () => {
      const dto = plainToClass(CreateTaskDto, {
        name: 123 as any,
        description: 'Descripción de la tarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        status: 1,
        priority: 1,
        valley: 1,
        faena: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('debería fallar si falta status', async () => {
      const dto = plainToClass(CreateTaskDto, {
        name: 'Tarea 1',
        description: 'Descripción de la tarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        priority: 1,
        valley: 1,
        faena: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si status no es un número', async () => {
      const dto = plainToClass(CreateTaskDto, {
        name: 'Tarea 1',
        description: 'Descripción de la tarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        status: '1' as any,
        priority: 1,
        valley: 1,
        faena: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('debería fallar si startDate no es una fecha válida', async () => {
      const dto = plainToClass(CreateTaskDto, {
        name: 'Tarea 1',
        description: 'Descripción de la tarea',
        budget: 1000,
        expense: 500,
        startDate: 'invalid-date' as any,
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        status: 1,
        priority: 1,
        valley: 1,
        faena: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('startDate');
      expect(errors[0].constraints).toHaveProperty('isDate');
    });
  });

  describe('UpdateTaskDto', () => {
    it('debería validar un DTO válido con todos los campos', async () => {
      const dto = plainToClass(UpdateTaskDto, {
        name: 'Tarea 1',
        description: 'Descripción de la tarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        status: 1,
        priority: 1,
        valley: 1,
        faena: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar un DTO con solo algunos campos', async () => {
      const dto = plainToClass(UpdateTaskDto, {
        name: 'Tarea 1',
        description: 'Descripción de la tarea',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar un DTO vacío', async () => {
      const dto = plainToClass(UpdateTaskDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si name no es un string', async () => {
      const dto = plainToClass(UpdateTaskDto, {
        name: 123 as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('debería fallar si status no es un número', async () => {
      const dto = plainToClass(UpdateTaskDto, {
        status: '1' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('debería fallar si startDate no es una fecha válida', async () => {
      const dto = plainToClass(UpdateTaskDto, {
        startDate: 'invalid-date' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('startDate');
      expect(errors[0].constraints).toHaveProperty('isDate');
    });
  });
}); 