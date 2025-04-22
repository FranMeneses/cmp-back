import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BeneficiariesService } from './beneficiaries.service';
import { Beneficiary, CreateBeneficiaryInput, UpdateBeneficiaryInput } from '../graphql/graphql.types';

@Resolver(() => Beneficiary)
export class BeneficiariesResolver {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Query(() => [Beneficiary])
  async beneficiaries(@Args('query', { type: () => String, nullable: true }) query?: string) {
    return this.beneficiariesService.findAllBeneficiaries(query ? JSON.parse(query) : {});
  }

  @Query(() => Beneficiary)
  async beneficiary(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.findOneBeneficiary(id);
  }

  @Mutation(() => Beneficiary)
  async createBeneficiary(@Args('input') input: CreateBeneficiaryInput) {
    return this.beneficiariesService.createBeneficiary(input);
  }

  @Mutation(() => Beneficiary)
  async updateBeneficiary(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBeneficiaryInput,
  ) {
    return this.beneficiariesService.updateBeneficiary(id, input);
  }

  @Mutation(() => Beneficiary)
  async deleteBeneficiary(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.removeBeneficiary(id);
  }
} 