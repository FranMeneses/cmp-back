import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('beneficiaries')
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  // Beneficiary endpoints
  @Post()
  createBeneficiary(@Body() createBeneficiaryDto: CreateBeneficiaryDto) {
    return this.beneficiariesService.createBeneficiary(createBeneficiaryDto);
  }

  @Get()
  findAllBeneficiaries(@Query() query: any) {
    return this.beneficiariesService.findAllBeneficiaries(query);
  }

  @Get(':id')
  findOneBeneficiary(@Param('id') id: string) {
    return this.beneficiariesService.findOneBeneficiary(id);
  }

  @Patch(':id')
  updateBeneficiary(@Param('id') id: string, @Body() updateBeneficiaryDto: UpdateBeneficiaryDto) {
    return this.beneficiariesService.updateBeneficiary(id, updateBeneficiaryDto);
  }

  @Delete(':id')
  removeBeneficiary(@Param('id') id: string) {
    return this.beneficiariesService.removeBeneficiary(id);
  }

  // Contact endpoints
  @Post('contacts')
  createContact(@Body() createContactDto: CreateContactDto) {
    return this.beneficiariesService.createContact(createContactDto);
  }

  @Get('contacts')
  findAllContacts(@Query() query: any) {
    return this.beneficiariesService.findAllContacts(query);
  }

  @Get('contacts/:id')
  findOneContact(@Param('id') id: string) {
    return this.beneficiariesService.findOneContact(id);
  }

  @Patch('contacts/:id')
  updateContact(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.beneficiariesService.updateContact(id, updateContactDto);
  }

  @Delete('contacts/:id')
  removeContact(@Param('id') id: string) {
    return this.beneficiariesService.removeContact(id);
  }
} 