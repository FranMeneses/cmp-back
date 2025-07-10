import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { Beneficiary, Contact } from '../graphql/graphql.types';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

/**
 * Resolver GraphQL para operaciones de beneficiarios y contactos.
 * 
 * @description Proporciona la API GraphQL completa para:
 * - CRUD de beneficiarios: entidades que reciben beneficios de las tareas
 * - CRUD de contactos: personas de referencia dentro de cada beneficiario
 * - Operaciones públicas sin restricciones de roles
 * - Retorno de datos enriquecidos con relaciones incluidas
 * 
 * @class BeneficiariesResolver
 * @since 1.0.0
 */
@Resolver(() => Beneficiary)
export class BeneficiariesResolver {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  /**
   * Crea un nuevo beneficiario en el sistema.
   * 
   * @param input - Datos del beneficiario a crear
   * @returns Beneficiario creado con relaciones incluidas
   */
  @Mutation(() => Beneficiary)
  createBeneficiary(@Args('input') input: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(input);
  }

  /**
   * Obtiene la lista completa de beneficiarios.
   * 
   * @returns Lista de todos los beneficiarios con contactos y tareas
   */
  @Query(() => [Beneficiary])
  beneficiaries() {
    return this.beneficiariesService.findAll();
  }

  /**
   * Busca un beneficiario específico por ID.
   * 
   * @param id - ID único del beneficiario
   * @returns Beneficiario encontrado con sus relaciones
   */
  @Query(() => Beneficiary)
  beneficiary(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.findOne(id);
  }

  /**
   * Actualiza los datos de un beneficiario existente.
   * 
   * @param id - ID del beneficiario a actualizar
   * @param input - Nuevos datos del beneficiario
   * @returns Beneficiario actualizado
   */
  @Mutation(() => Beneficiary)
  updateBeneficiary(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBeneficiaryDto
  ) {
    return this.beneficiariesService.update(id, input);
  }

  /**
   * Elimina un beneficiario y todos sus contactos asociados.
   * 
   * @param id - ID del beneficiario a eliminar
   * @returns Beneficiario eliminado con sus datos previos
   */
  @Mutation(() => Beneficiary)
  removeBeneficiary(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.remove(id);
  }

  /**
   * Crea un nuevo contacto asociado a un beneficiario.
   * 
   * @param input - Datos del contacto a crear
   * @returns Contacto creado con información del beneficiario
   */
  @Mutation(() => Contact)
  createContact(@Args('input') input: CreateContactDto) {
    return this.beneficiariesService.createContact(input);
  }

  /**
   * Obtiene la lista completa de contactos del sistema.
   * 
   * @returns Lista de todos los contactos con información de beneficiarios
   */
  @Query(() => [Contact])
  contacts() {
    return this.beneficiariesService.findAllContacts();
  }

  /**
   * Busca un contacto específico por ID.
   * 
   * @param id - ID único del contacto
   * @returns Contacto encontrado con información del beneficiario
   */
  @Query(() => Contact)
  contact(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.findOneContact(id);
  }

  /**
   * Actualiza los datos de un contacto existente.
   * 
   * @param id - ID del contacto a actualizar
   * @param input - Nuevos datos del contacto
   * @returns Contacto actualizado
   */
  @Mutation(() => Contact)
  updateContact(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateContactDto
  ) {
    return this.beneficiariesService.updateContact(id, input);
  }

  /**
   * Elimina un contacto específico del sistema.
   * 
   * @param id - ID del contacto a eliminar
   * @returns Contacto eliminado con sus datos previos
   */
  @Mutation(() => Contact)
  removeContact(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.removeContact(id);
  }
} 