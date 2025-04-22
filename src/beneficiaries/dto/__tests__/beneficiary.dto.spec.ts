import { CreateBeneficiaryDto } from '../create-beneficiary.dto';
import { UpdateBeneficiaryDto } from '../update-beneficiary.dto';
import { ValidationPipe } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('Beneficiary DTOs', () => {
  describe('CreateBeneficiaryDto', () => {
    it('debería validar un DTO válido', async () => {
      const dto = plainToClass(CreateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si falta legalName', async () => {
      const dto = plainToClass(CreateBeneficiaryDto, {
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('legalName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si falta rut', async () => {
      const dto = plainToClass(CreateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('rut');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si falta address', async () => {
      const dto = plainToClass(CreateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('address');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si falta entityType', async () => {
      const dto = plainToClass(CreateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('entityType');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si falta representative', async () => {
      const dto = plainToClass(CreateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        hasLegalPersonality: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('representative');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si falta hasLegalPersonality', async () => {
      const dto = plainToClass(CreateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('hasLegalPersonality');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('debería fallar si hasLegalPersonality no es booleano', async () => {
      const dto = plainToClass(CreateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: 'true' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('hasLegalPersonality');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });

  describe('UpdateBeneficiaryDto', () => {
    it('debería validar un DTO válido con todos los campos', async () => {
      const dto = plainToClass(UpdateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        rut: '12345678-9',
        address: 'Test Address',
        entityType: 'Test Type',
        representative: 'Test Representative',
        hasLegalPersonality: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar un DTO con solo algunos campos', async () => {
      const dto = plainToClass(UpdateBeneficiaryDto, {
        legalName: 'Test Beneficiary',
        hasLegalPersonality: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar un DTO vacío', async () => {
      const dto = plainToClass(UpdateBeneficiaryDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar si hasLegalPersonality no es booleano', async () => {
      const dto = plainToClass(UpdateBeneficiaryDto, {
        hasLegalPersonality: 'true' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('hasLegalPersonality');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
}); 