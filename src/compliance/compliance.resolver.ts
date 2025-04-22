import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ComplianceService } from './compliance.service';
import { Compliance, CreateComplianceInput, UpdateComplianceInput } from '../graphql/graphql.types';

@Resolver(() => Compliance)
export class ComplianceResolver {
  constructor(private readonly complianceService: ComplianceService) {}

  @Query(() => [Compliance])
  async compliances(@Args('query', { type: () => String, nullable: true }) query?: string) {
    return this.complianceService.findAll(query ? JSON.parse(query) : {});
  }

  @Query(() => Compliance)
  async compliance(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.findOne(id);
  }

  @Mutation(() => Compliance)
  async createCompliance(@Args('input') input: CreateComplianceInput) {
    return this.complianceService.create(input);
  }

  @Mutation(() => Compliance)
  async updateCompliance(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateComplianceInput,
  ) {
    return this.complianceService.update(id, input);
  }

  @Mutation(() => Compliance)
  async deleteCompliance(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.remove(id);
  }
} 