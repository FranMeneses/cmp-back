import { IsString, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';

/**
 * DTO para la actualización de contactos existentes.
 * 
 * @description Permite la actualización parcial de cualquier campo de un contacto.
 * Todos los campos son opcionales para permitir actualizaciones granulares
 * incluyendo reasignación a otro beneficiario si es necesario.
 * 
 * @class UpdateContactDto
 * @since 1.0.0
 */
@InputType()
export class UpdateContactDto {
  /**
   * Nuevo beneficiario al que se asignará el contacto.
   */
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  beneficiaryId?: string;

  /**
   * Nuevo nombre del contacto.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Nuevo cargo del contacto.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  position?: string;

  /**
   * Nueva dirección de correo electrónico.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email?: string;

  /**
   * Nuevo número de teléfono.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;
} 