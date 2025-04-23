import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { Beneficiary } from '../graphql/graphql.types';

@Resolver(() => Beneficiary)
export class BeneficiariesResolver {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Mutation(() => Beneficiary)
  createBeneficiary(@Args('input') input: CreateBeneficiaryDto) {
    return this.beneficiariesService.createBeneficiary(input);
  }

  @Query(() => [Beneficiary])
  beneficiaries(@Args('query', { nullable: true }) query?: string) {
    return this.beneficiariesService.findAllBeneficiaries(query ? JSON.parse(query) : {});
  }

  @Query(() => Beneficiary)
  beneficiary(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.findOneBeneficiary(id);
  }

  @Mutation(() => Beneficiary)
  updateBeneficiary(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBeneficiaryDto
  ) {
    return this.beneficiariesService.updateBeneficiary(id, input);
  }

  @Mutation(() => Beneficiary)
  removeBeneficiary(@Args('id', { type: () => ID }) id: string) {
    return this.beneficiariesService.removeBeneficiary(id);
  }
} 