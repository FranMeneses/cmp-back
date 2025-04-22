import { CreateSubtaskDto } from '../create-subtask.dto';
import { UpdateSubtaskDto } from '../update-subtask.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('Subtask DTOs', () => {
  describe('CreateSubtaskDto', () => {
    it('debería validar un DTO válido', async () => {
      const dto = plainToClass(CreateSubtaskDto, {
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        number: 1,
        name: 'Subtarea 1',
        description: 'Descripción de la subtarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        beneficiaryId: '123e4567-e89b-12d3-a456-426614174001',
        statusId: 1,
        priorityId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si falta taskId', async () => {
      const dto = plainToClass(CreateSubtaskDto, {
        number: 1,
        name: 'Subtarea 1',
        description: 'Descripción de la subtarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        beneficiaryId: '123e4567-e89b-12d3-a456-426614174001',
        statusId: 1,
        priorityId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('taskId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si taskId no es un UUID válido', async () => {
      const dto = plainToClass(CreateSubtaskDto, {
        taskId: 'invalid-uuid',
        number: 1,
        name: 'Subtarea 1',
        description: 'Descripción de la subtarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        beneficiaryId: '123e4567-e89b-12d3-a456-426614174001',
        statusId: 1,
        priorityId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('taskId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('debería fallar si number no es un número entero', async () => {
      const dto = plainToClass(CreateSubtaskDto, {
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        number: '1' as any,
        name: 'Subtarea 1',
        description: 'Descripción de la subtarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        beneficiaryId: '123e4567-e89b-12d3-a456-426614174001',
        statusId: 1,
        priorityId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('number');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('debería fallar si name no es un string', async () => {
      const dto = plainToClass(CreateSubtaskDto, {
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        number: 1,
        name: 123 as any,
        description: 'Descripción de la subtarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        beneficiaryId: '123e4567-e89b-12d3-a456-426614174001',
        statusId: 1,
        priorityId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('debería fallar si startDate no es una fecha válida', async () => {
      const dto = plainToClass(CreateSubtaskDto, {
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        number: 1,
        name: 'Subtarea 1',
        description: 'Descripción de la subtarea',
        budget: 1000,
        expense: 500,
        startDate: 'invalid-date' as any,
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        beneficiaryId: '123e4567-e89b-12d3-a456-426614174001',
        statusId: 1,
        priorityId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('startDate');
      expect(errors[0].constraints).toHaveProperty('isDate');
    });
  });

  describe('UpdateSubtaskDto', () => {
    it('debería validar un DTO válido con todos los campos', async () => {
      const dto = plainToClass(UpdateSubtaskDto, {
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        number: 1,
        name: 'Subtarea 1',
        description: 'Descripción de la subtarea',
        budget: 1000,
        expense: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        finalDate: new Date('2024-12-31'),
        beneficiaryId: '123e4567-e89b-12d3-a456-426614174001',
        statusId: 1,
        priorityId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar un DTO con solo algunos campos', async () => {
      const dto = plainToClass(UpdateSubtaskDto, {
        name: 'Subtarea 1',
        description: 'Descripción de la subtarea',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar un DTO vacío', async () => {
      const dto = plainToClass(UpdateSubtaskDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si taskId no es un UUID válido', async () => {
      const dto = plainToClass(UpdateSubtaskDto, {
        taskId: 'invalid-uuid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('taskId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('debería fallar si number no es un número entero', async () => {
      const dto = plainToClass(UpdateSubtaskDto, {
        number: '1' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('number');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('debería fallar si startDate no es una fecha válida', async () => {
      const dto = plainToClass(UpdateSubtaskDto, {
        startDate: 'invalid-date' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('startDate');
      expect(errors[0].constraints).toHaveProperty('isDate');
    });
  });
}); 