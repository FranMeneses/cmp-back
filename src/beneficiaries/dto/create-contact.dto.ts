import { IsString, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';

/**
 * DTO para la creación de nuevos contactos asociados a beneficiarios.
 * 
 * @description Define la estructura de datos necesaria para crear un contacto
 * dentro de un beneficiario específico. Los contactos representan personas
 * de referencia dentro de la organización beneficiaria.
 * 
 * @class CreateContactDto
 * @since 1.0.0
 */
@InputType()
export class CreateContactDto {
  /**
   * ID del beneficiario al que pertenece este contacto.
   */
  @Field(() => ID)
  @IsUUID()
  beneficiaryId: string;

  /**
   * Nombre completo de la persona de contacto.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Cargo o posición de la persona dentro de la organización.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  position?: string;

  /**
   * Dirección de correo electrónico del contacto.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email?: string;

  /**
   * Número de teléfono del contacto.
   */
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;
} 