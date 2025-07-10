import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

/**
 * DTO para la creación de nuevos beneficiarios en el sistema.
 * 
 * @description Define la estructura de datos necesaria para crear un beneficiario,
 * incluyendo información legal, organizacional y de representación.
 * Los beneficiarios son entidades que reciben los beneficios de las tareas ejecutadas.
 * 
 * @class CreateBeneficiaryDto
 * @since 1.0.0
 */
@InputType()
export class CreateBeneficiaryDto {
  /**
   * Nombre legal oficial del beneficiario o entidad.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  legalName?: string;

  /**
   * RUT (Rol Único Tributario) del beneficiario.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  rut?: string;

  /**
   * Dirección física o legal del beneficiario.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * Tipo de entidad del beneficiario (ej: ONG, empresa, institución).
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  entityType?: string;

  /**
   * Nombre del representante legal del beneficiario.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  representative?: string;

  /**
   * Indica si el beneficiario tiene personalidad jurídica.
   */
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  hasLegalPersonality?: boolean;
} 