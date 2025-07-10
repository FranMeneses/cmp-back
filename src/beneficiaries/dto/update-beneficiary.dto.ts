import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

/**
 * DTO para la actualización de beneficiarios existentes.
 * 
 * @description Permite la actualización parcial de cualquier campo de un beneficiario.
 * Todos los campos son opcionales para permitir actualizaciones granulares
 * de información legal, organizacional o de contacto.
 * 
 * @class UpdateBeneficiaryDto
 * @since 1.0.0
 */
@InputType()
export class UpdateBeneficiaryDto {
  /**
   * Nuevo nombre legal del beneficiario.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  legalName?: string;

  /**
   * Nuevo RUT del beneficiario.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  rut?: string;

  /**
   * Nueva dirección del beneficiario.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * Nuevo tipo de entidad del beneficiario.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  entityType?: string;

  /**
   * Nuevo representante legal del beneficiario.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  representative?: string;

  /**
   * Nuevo estado de personalidad jurídica del beneficiario.
   */
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  hasLegalPersonality?: boolean;
} 