import { CreateComplianceDto } from '../create-compliance.dto';
import { UpdateComplianceDto } from '../update-compliance.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('Compliance DTOs', () => {
  describe('CreateComplianceDto', () => {
    it('debería validar un DTO válido', async () => {
      const dto = plainToClass(CreateComplianceDto, {
        subtaskId: '123e4567-e89b-12d3-a456-426614174000',
        statusId: 1,
        applies: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si falta subtaskId', async () => {
      const dto = plainToClass(CreateComplianceDto, {
        statusId: 1,
        applies: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('subtaskId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si falta statusId', async () => {
      const dto = plainToClass(CreateComplianceDto, {
        subtaskId: '123e4567-e89b-12d3-a456-426614174000',
        applies: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('statusId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si falta applies', async () => {
      const dto = plainToClass(CreateComplianceDto, {
        subtaskId: '123e4567-e89b-12d3-a456-426614174000',
        statusId: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('applies');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería validar subtaskId como string', async () => {
      const dto = plainToClass(CreateComplianceDto, {
        subtaskId: 'cualquier-string',
        statusId: 1,
        applies: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si statusId no es un número', async () => {
      const dto = plainToClass(CreateComplianceDto, {
        subtaskId: '123e4567-e89b-12d3-a456-426614174000',
        statusId: '1' as any,
        applies: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('statusId');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('debería fallar si applies no es un booleano', async () => {
      const dto = plainToClass(CreateComplianceDto, {
        subtaskId: '123e4567-e89b-12d3-a456-426614174000',
        statusId: 1,
        applies: 'true' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('applies');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });

  describe('UpdateComplianceDto', () => {
    it('debería validar un DTO válido con todos los campos', async () => {
      const dto = plainToClass(UpdateComplianceDto, {
        subtaskId: '123e4567-e89b-12d3-a456-426614174000',
        statusId: 1,
        applies: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar un DTO con solo algunos campos', async () => {
      const dto = plainToClass(UpdateComplianceDto, {
        subtaskId: '123e4567-e89b-12d3-a456-426614174000',
        applies: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar un DTO vacío', async () => {
      const dto = plainToClass(UpdateComplianceDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar subtaskId como string', async () => {
      const dto = plainToClass(UpdateComplianceDto, {
        subtaskId: 'cualquier-string',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si statusId no es un número', async () => {
      const dto = plainToClass(UpdateComplianceDto, {
        statusId: '1' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('statusId');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('debería fallar si applies no es un booleano', async () => {
      const dto = plainToClass(UpdateComplianceDto, {
        applies: 'true' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('applies');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
}); 