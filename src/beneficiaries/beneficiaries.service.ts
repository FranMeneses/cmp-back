import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}

  private mapBeneficiaryToDatabase(beneficiaryDto: CreateBeneficiaryDto | UpdateBeneficiaryDto) {
    return {
      nombre_legal: beneficiaryDto.legalName,
      rut: beneficiaryDto.rut,
      direccion: beneficiaryDto.address,
      tipo_entidad: beneficiaryDto.entityType,
      representante: beneficiaryDto.representative,
      personalidad_juridica: beneficiaryDto.hasLegalPersonality,
    };
  }

  private mapContactToDatabase(contactDto: CreateContactDto | UpdateContactDto) {
    return {
      id_beneficiario: contactDto.beneficiaryId,
      nombre: contactDto.name,
      cargo: contactDto.position,
      mail: contactDto.email,
      phone: contactDto.phone,
    };
  }

  private mapBeneficiaryFromDatabase(beneficiary: any) {
    return {
      id: beneficiary.id_beneficiario,
      legalName: beneficiary.nombre_legal,
      rut: beneficiary.rut,
      address: beneficiary.direccion,
      entityType: beneficiary.tipo_entidad,
      representative: beneficiary.representante,
      hasLegalPersonality: beneficiary.personalidad_juridica,
      contacts: beneficiary.contactos?.map(contact => ({
        id: contact.id_contacto,
        name: contact.nombre,
        position: contact.cargo,
        email: contact.mail,
        phone: contact.phone
      })) || [],
      subtasks: beneficiary.subtareas?.map(subtask => ({
        id: subtask.id_subtarea,
        name: subtask.nombre,
        description: subtask.descripcion,
        status: subtask.subtarea_estado ? {
          id: subtask.subtarea_estado.id_subtarea_estado,
          name: subtask.subtarea_estado.estado,
          percentage: subtask.subtarea_estado.porcentaje
        } : null
      })) || []
    };
  }

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
  async createBeneficiary(createBeneficiaryDto: CreateBeneficiaryDto) {
    const beneficiary = await this.prisma.beneficiario.create({
      data: this.mapBeneficiaryToDatabase(createBeneficiaryDto),
      include: {
        contactos: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      },
    });
    return this.mapBeneficiaryFromDatabase(beneficiary);
  }

  async findAllBeneficiaries(query: any) {
    const beneficiaries = await this.prisma.beneficiario.findMany({
      where: query,
      include: {
        contactos: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      },
    });
    return beneficiaries.map(beneficiary => this.mapBeneficiaryFromDatabase(beneficiary));
  }

  async findOneBeneficiary(id: string) {
    const beneficiary = await this.prisma.beneficiario.findUnique({
      where: { id_beneficiario: id },
      include: {
        contactos: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      },
    });
    return beneficiary ? this.mapBeneficiaryFromDatabase(beneficiary) : null;
  }

  async updateBeneficiary(id: string, updateBeneficiaryDto: UpdateBeneficiaryDto) {
    const beneficiary = await this.prisma.beneficiario.update({
      where: { id_beneficiario: id },
      data: this.mapBeneficiaryToDatabase(updateBeneficiaryDto),
      include: {
        contactos: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      },
    });
    return this.mapBeneficiaryFromDatabase(beneficiary);
  }

  async removeBeneficiary(id: string) {
    const beneficiary = await this.prisma.beneficiario.delete({
      where: { id_beneficiario: id },
      include: {
        contactos: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      },
    });
    return this.mapBeneficiaryFromDatabase(beneficiary);
  }

  // Contact CRUD
  async createContact(createContactDto: CreateContactDto) {
    const contact = await this.prisma.contacto.create({
      data: this.mapContactToDatabase(createContactDto),
      include: {
        beneficiario: true
      },
    });
    return this.mapContactFromDatabase(contact);
  }

  async findAllContacts(query: any) {
    const contacts = await this.prisma.contacto.findMany({
      where: query,
      include: {
        beneficiario: true
      },
    });
    return contacts.map(contact => this.mapContactFromDatabase(contact));
  }

  async findOneContact(id: string) {
    const contact = await this.prisma.contacto.findUnique({
      where: { id_contacto: id },
      include: {
        beneficiario: true
      },
    });
    return contact ? this.mapContactFromDatabase(contact) : null;
  }

  async updateContact(id: string, updateContactDto: UpdateContactDto) {
    const contact = await this.prisma.contacto.update({
      where: { id_contacto: id },
      data: this.mapContactToDatabase(updateContactDto),
      include: {
        beneficiario: true
      },
    });
    return this.mapContactFromDatabase(contact);
  }

  async removeContact(id: string) {
    const contact = await this.prisma.contacto.delete({
      where: { id_contacto: id },
      include: {
        beneficiario: true
      },
    });
    return this.mapContactFromDatabase(contact);
  }
} 