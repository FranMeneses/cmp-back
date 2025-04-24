import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { Beneficiary, Contact } from '../graphql/graphql.types';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Resolver(() => Beneficiary)
export class BeneficiariesResolver {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Mutation(() => Beneficiary)
  createBeneficiary(@Args('input') input: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(input);
  }

  @Query(() => [Beneficiary])
  beneficiaries() {
    return this.beneficiariesService.findAll();
  }

  @Query(() => Beneficiary)
  beneficiary(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.findOne(id);
  }

  @Mutation(() => Beneficiary)
  updateBeneficiary(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBeneficiaryDto
  ) {
    return this.beneficiariesService.update(id, input);
  }

  @Mutation(() => Beneficiary)
  removeBeneficiary(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.remove(id);
  }

  @Mutation(() => Contact)
  createContact(@Args('input') input: CreateContactDto) {
    return this.beneficiariesService.createContact(input);
  }

  @Query(() => [Contact])
  contacts() {
    return this.beneficiariesService.findAllContacts();
  }

  @Query(() => Contact)
  contact(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.findOneContact(id);
  }

  @Mutation(() => Contact)
  updateContact(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateContactDto
  ) {
    return this.beneficiariesService.updateContact(id, input);
  }

  @Mutation(() => Contact)
  removeContact(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.removeContact(id);
  }
} 