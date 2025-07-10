import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

/**
 * Servicio para la gestión completa de beneficiarios y contactos.
 * 
 * @description Proporciona funcionalidades CRUD completas para:
 * - Beneficiarios: entidades que reciben los beneficios de las tareas
 * - Contactos: personas de referencia dentro de cada beneficiario
 * 
 * Incluye mapeo automático entre formatos de base de datos y GraphQL,
 * manejo de relaciones con tareas, y operaciones transaccionales para
 * mantener la integridad referencial.
 * 
 * @class BeneficiariesService
 * @since 1.0.0
 */
@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mapea datos de beneficiario desde formato DTO al formato de base de datos.
   * 
   * @param beneficiaryDto - DTO de creación o actualización de beneficiario
   * @returns Objeto con estructura de base de datos
   */
  private mapToDatabase(beneficiaryDto: CreateBeneficiaryDto | UpdateBeneficiaryDto) {
    return {
      nombre_legal: beneficiaryDto.legalName,
      rut: beneficiaryDto.rut,
      direccion: beneficiaryDto.address,
      tipo_entidad: beneficiaryDto.entityType,
      representante: beneficiaryDto.representative,
      personalidad_juridica: beneficiaryDto.hasLegalPersonality
    };
  }

  /**
   * Mapea datos de beneficiario desde formato de base de datos al formato GraphQL.
   * 
   * @param beneficiary - Objeto de beneficiario de la base de datos
   * @returns Objeto con estructura GraphQL incluyendo contactos y tareas relacionadas
   */
  private mapFromDatabase(beneficiary: any) {
    return {
      id: beneficiary.id_beneficiario,
      legalName: beneficiary.nombre_legal,
      rut: beneficiary.rut,
      address: beneficiary.direccion,
      entityType: beneficiary.tipo_entidad,
      representative: beneficiary.representante,
      hasLegalPersonality: beneficiary.personalidad_juridica,
      contacts: beneficiary.contacto?.map(contact => ({
        id: contact.id_contacto,
        name: contact.nombre,
        position: contact.cargo,
        email: contact.mail,
        phone: contact.phone
      })) || [],
      tasks: beneficiary.tareas?.map(task => ({
        id: task.id_tarea,
        name: task.nombre,
        description: task.descripcion,
        status: task.tarea_estado ? {
          id: task.tarea_estado.id_tarea_estado,
          name: task.tarea_estado.estado
        } : null
      })) || []
    };
  }

  /**
   * Mapea datos de contacto desde formato DTO al formato de base de datos.
   * 
   * @param contactDto - DTO de creación o actualización de contacto
   * @returns Objeto con estructura de base de datos
   */
  private mapContactToDatabase(contactDto: CreateContactDto | UpdateContactDto) {
    return {
      id_beneficiario: contactDto.beneficiaryId,
      nombre: contactDto.name,
      cargo: contactDto.position,
      mail: contactDto.email,
      phone: contactDto.phone
    };
  }

  /**
   * Mapea datos de contacto desde formato de base de datos al formato GraphQL.
   * 
   * @param contact - Objeto de contacto de la base de datos
   * @returns Objeto con estructura GraphQL incluyendo información del beneficiario
   */
  private mapContactFromDatabase(contact: any) {
    return {
      id: contact.id_contacto,
      beneficiaryId: contact.id_beneficiario,
      name: contact.nombre,
      position: contact.cargo,
      email: contact.mail,
      phone: contact.phone,
      beneficiary: contact.beneficiario ? {
        id: contact.beneficiario.id_beneficiario,
        legalName: contact.beneficiario.nombre_legal,
        rut: contact.beneficiario.rut,
        address: contact.beneficiario.direccion,
        entityType: contact.beneficiario.tipo_entidad,
        representative: contact.beneficiario.representante,
        hasLegalPersonality: contact.beneficiario.personalidad_juridica
      } : null
    };
  }

  // Beneficiary CRUD
  /**
   * Crea un nuevo beneficiario en el sistema.
   * 
   * @param createBeneficiaryDto - Datos del beneficiario a crear
   * @returns Beneficiario creado con sus relaciones incluidas
   * @throws Error si hay problemas en la creación
   */
  async create(createBeneficiaryDto: CreateBeneficiaryDto) {
    const beneficiary = await this.prisma.beneficiario.create({
      data: this.mapToDatabase(createBeneficiaryDto),
      include: {
        contacto: true,
        tareas: {
          include: {
            tarea_estado: true
          }
        }
      }
    });
    return this.mapFromDatabase(beneficiary);
  }

  /**
   * Recupera todos los beneficiarios del sistema.
   * 
   * @returns Lista completa de beneficiarios con contactos y tareas relacionadas
   */
  async findAll() {
    const beneficiaries = await this.prisma.beneficiario.findMany({
      include: {
        contacto: true,
        tareas: {
          include: {
            tarea_estado: true
          }
        }
      }
    });
    return beneficiaries.map(beneficiary => this.mapFromDatabase(beneficiary));
  }

  /**
   * Busca un beneficiario específico por su ID.
   * 
   * @param id - ID único del beneficiario
   * @returns Beneficiario encontrado con sus relaciones o null si no existe
   */
  async findOne(id: string) {
    const beneficiary = await this.prisma.beneficiario.findUnique({
      where: { id_beneficiario: id },
      include: {
        contacto: true,
        tareas: {
          include: {
            tarea_estado: true
          }
        }
      }
    });
    return beneficiary ? this.mapFromDatabase(beneficiary) : null;
  }

  /**
   * Actualiza los datos de un beneficiario existente.
   * 
   * @param id - ID del beneficiario a actualizar
   * @param updateBeneficiaryDto - Nuevos datos del beneficiario
   * @returns Beneficiario actualizado con sus relaciones
   * @throws Error si el beneficiario no existe
   */
  async update(id: string, updateBeneficiaryDto: UpdateBeneficiaryDto) {
    const beneficiary = await this.prisma.beneficiario.update({
      where: { id_beneficiario: id },
      data: this.mapToDatabase(updateBeneficiaryDto),
      include: {
        contacto: true,
        tareas: {
          include: {
            tarea_estado: true
          }
        }
      }
    });
    return this.mapFromDatabase(beneficiary);
  }

  /**
   * Elimina un beneficiario y todos sus contactos asociados.
   * 
   * @description Utiliza una transacción para garantizar integridad referencial:
   * 1. Elimina todos los contactos del beneficiario
   * 2. Elimina el beneficiario
   * 
   * @param id - ID del beneficiario a eliminar
   * @returns Beneficiario eliminado con sus datos previos
   * @throws Error si el beneficiario no existe
   */
  async remove(id: string) {
    const beneficiary = await this.prisma.beneficiario.findUnique({
      where: { id_beneficiario: id },
      include: {
        contacto: true,
        tareas: {
          include: {
            tarea_estado: true
          }
        }
      }
    });

    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    await this.prisma.$transaction(async (prisma) => {
      // 1. Eliminar contactos
      if (beneficiary.contacto.length > 0) {
        await prisma.contacto.deleteMany({
          where: { id_beneficiario: id }
        });
      }

      // 2. Finalmente, eliminar el beneficiario
      await prisma.beneficiario.delete({
        where: { id_beneficiario: id }
      });
    });

    return this.mapFromDatabase(beneficiary);
  }

  // Contact CRUD
  /**
   * Crea un nuevo contacto asociado a un beneficiario.
   * 
   * @param createContactDto - Datos del contacto a crear
   * @returns Contacto creado con información del beneficiario asociado
   * @throws Error si el beneficiario especificado no existe
   */
  async createContact(createContactDto: CreateContactDto) {
    const contact = await this.prisma.contacto.create({
      data: this.mapContactToDatabase(createContactDto),
      include: {
        beneficiario: true
      }
    });
    return this.mapContactFromDatabase(contact);
  }

  /**
   * Recupera todos los contactos del sistema.
   * 
   * @returns Lista completa de contactos con información de sus beneficiarios
   */
  async findAllContacts() {
    const contacts = await this.prisma.contacto.findMany({
      include: {
        beneficiario: true
      }
    });
    return contacts.map(contact => this.mapContactFromDatabase(contact));
  }

  /**
   * Busca un contacto específico por su ID.
   * 
   * @param id - ID único del contacto
   * @returns Contacto encontrado con información del beneficiario o null si no existe
   */
  async findOneContact(id: string) {
    const contact = await this.prisma.contacto.findUnique({
      where: { id_contacto: id },
      include: {
        beneficiario: true
      }
    });
    return contact ? this.mapContactFromDatabase(contact) : null;
  }

  /**
   * Actualiza los datos de un contacto existente.
   * 
   * @param id - ID del contacto a actualizar
   * @param updateContactDto - Nuevos datos del contacto
   * @returns Contacto actualizado con información del beneficiario
   * @throws Error si el contacto no existe
   */
  async updateContact(id: string, updateContactDto: UpdateContactDto) {
    const contact = await this.prisma.contacto.update({
      where: { id_contacto: id },
      data: this.mapContactToDatabase(updateContactDto),
      include: {
        beneficiario: true
      }
    });
    return this.mapContactFromDatabase(contact);
  }

  /**
   * Elimina un contacto específico del sistema.
   * 
   * @param id - ID del contacto a eliminar
   * @returns Contacto eliminado con sus datos previos
   * @throws Error si el contacto no existe
   */
  async removeContact(id: string) {
    const contact = await this.prisma.contacto.delete({
      where: { id_contacto: id },
      include: {
        beneficiario: true
      }
    });
    return this.mapContactFromDatabase(contact);
  }
} 