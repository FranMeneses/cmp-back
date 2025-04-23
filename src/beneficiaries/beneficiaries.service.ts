import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(beneficiaryDto: CreateBeneficiaryDto | UpdateBeneficiaryDto) {
    return {
      nombre_legal: beneficiaryDto.nombre_legal,
      rut: beneficiaryDto.rut,
      direccion: beneficiaryDto.direccion,
      tipo_entidad: beneficiaryDto.tipo_entidad,
      representante: beneficiaryDto.representante,
      personalidad_juridica: Boolean(beneficiaryDto.personalidad_juridica)
    };
  }

  private mapContactToDatabase(contactDto: CreateContactDto | UpdateContactDto) {
    return {
      id_beneficiario: contactDto.id_beneficiario,
      nombre: contactDto.nombre,
      cargo: contactDto.cargo,
      mail: contactDto.mail,
      phone: contactDto.phone
    };
  }

  private mapFromDatabase(beneficiary: any) {
    return {
      id: beneficiary.id_beneficiario,
      nombre_legal: beneficiary.nombre_legal,
      rut: beneficiary.rut,
      direccion: beneficiary.direccion,
      tipo_entidad: beneficiary.tipo_entidad,
      representante: beneficiary.representante,
      personalidad_juridica: beneficiary.personalidad_juridica ? 1 : 0,
      contactos: beneficiary.contactos?.map(contact => ({
        id: contact.id_contacto,
        nombre: contact.nombre,
        cargo: contact.cargo,
        mail: contact.mail,
        phone: contact.phone
      })) || [],
      subtareas: beneficiary.subtareas?.map(subtask => ({
        id: subtask.id_subtarea,
        nombre: subtask.nombre,
        descripcion: subtask.descripcion,
        estado: subtask.subtarea_estado ? {
          id: subtask.subtarea_estado.id_subtarea_estado,
          nombre: subtask.subtarea_estado.estado,
          porcentaje: subtask.subtarea_estado.porcentaje
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
      data: this.mapToDatabase(createBeneficiaryDto),
      include: {
        contactos: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      }
    });
    return this.mapFromDatabase(beneficiary);
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
      }
    });
    return beneficiaries.map(beneficiary => this.mapFromDatabase(beneficiary));
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
      }
    });
    return beneficiary ? this.mapFromDatabase(beneficiary) : null;
  }

  async updateBeneficiary(id: string, updateBeneficiaryDto: UpdateBeneficiaryDto) {
    const beneficiary = await this.prisma.beneficiario.update({
      where: { id_beneficiario: id },
      data: this.mapToDatabase(updateBeneficiaryDto),
      include: {
        contactos: true,
        subtareas: {
          include: {
            subtarea_estado: true
          }
        }
      }
    });
    return this.mapFromDatabase(beneficiary);
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
      }
    });
    return this.mapFromDatabase(beneficiary);
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