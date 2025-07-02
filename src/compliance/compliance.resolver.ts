import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { ComplianceService } from './compliance.service';
import { Compliance, ComplianceStatus, CreateComplianceInput, UpdateComplianceInput } from '../graphql/graphql.types';
import { plainToInstance } from 'class-transformer';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';

@Resolver(() => Compliance)
export class ComplianceResolver {
  constructor(private readonly complianceService: ComplianceService) {}

  // Compliance CRUD Operations
  @Mutation(() => Compliance)
  async createCompliance(@Args('createComplianceInput') input: CreateComplianceInput) {
    const dto = plainToInstance(CreateComplianceDto, input);
    return this.complianceService.create(dto);
  }

  @Query(() => [Compliance])
  async findAllCompliances() {
    return this.complianceService.findAll();
  }

  @Query(() => Compliance, { nullable: true })
  async findOneCompliance(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.findOne(id);
  }

  @Mutation(() => Compliance)
  async updateCompliance(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateComplianceInput') input: UpdateComplianceInput,
  ) {
    const dto = plainToInstance(UpdateComplianceDto, input);
    return this.complianceService.update(id, dto);
  }

  @Mutation(() => String)
  async removeCompliance(@Args('id', { type: () => ID }) id: string) {
    const result = await this.complianceService.remove(id);
    return result.message;
  }

  // Task-related queries
  @Query(() => Compliance, { nullable: true })
  async getTaskCompliance(@Args('taskId', { type: () => ID }) taskId: string) {
    return this.complianceService.getTaskCompliance(taskId);
  }

  // Status-related queries
  @Query(() => [ComplianceStatus])
  async getAllComplianceStatuses() {
    return this.complianceService.getAllComplianceStatuses();
  }

  @Query(() => [Compliance])
  async getCompliancesByStatus(@Args('statusId', { type: () => Int }) statusId: number) {
    return this.complianceService.getCompliancesByStatus(statusId);
  }

  @Query(() => [Compliance])
  async getActiveCompliances() {
    return this.complianceService.getActiveCompliances();
  }

  // Process advancement
  @Mutation(() => Compliance)
  async advanceComplianceStatus(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.advanceStatus(id);
  }
} 