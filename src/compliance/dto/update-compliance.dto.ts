import { PartialType } from '@nestjs/mapped-types';
import { CreateComplianceDto } from './create-compliance.dto';
import { IsInt, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para la actualización de registros de cumplimiento existentes.
 * 
 * @description Permite actualizar información financiera, contable y de integración SAP.
 * Incluye lógica especial: al marcar 'listo' como true, el sistema automáticamente
 * avanza el estado a "Completado" (ID: 7).
 * 
 * @class UpdateComplianceDto
 * @since 1.0.0
 */
export class UpdateComplianceDto extends PartialType(CreateComplianceDto) {
  /**
   * Valor monetario asociado al cumplimiento.
   */
  @IsInt()
  @IsOptional()
  valor?: number;

  /**
   * Centro de costo para control contable.
   */
  @IsInt()
  @IsOptional()
  ceco?: number;

  /**
   * Número de cuenta contable.
   */
  @IsInt()
  @IsOptional()
  cuenta?: number;

  /**
   * Número de SOLPED/MEMO en sistema SAP.
   */
  @IsInt()
  @IsOptional()
  solpedMemoSap?: number;

  /**
   * Número de HES/HEM en sistema SAP.
   */
  @IsInt()
  @IsOptional()
  hesHemSap?: number;

  /**
   * Indica si el cumplimiento está listo para finalizar (auto-avanza a estado "Completado").
   */
  @IsBoolean()
  @IsOptional()
  listo?: boolean;
} 