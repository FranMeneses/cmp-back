import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { ComplianceService } from './compliance.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';
import { Compliance } from '../graphql/graphql.types';

@Resolver(() => Compliance)
export class ComplianceResolver {
  constructor(private readonly complianceService: ComplianceService) {}

  @Mutation(() => Compliance)
  createCompliance(@Args('input') input: CreateComplianceDto) {
    return this.complianceService.create(input);
  }

  @Query(() => [Compliance])
  compliances(@Args('query', { nullable: true }) query?: string) {
    return this.complianceService.findAll(query ? JSON.parse(query) : {});
  }

  @Query(() => Compliance)
  compliance(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.findOne(id);
  }

  @Mutation(() => Compliance)
  updateCompliance(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateComplianceDto
  ) {
    return this.complianceService.update(id, input);
  }

  @Mutation(() => Compliance)
  removeCompliance(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.remove(id);
  }
} 