import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ComplianceService } from './compliance.service';
import { Compliance, ComplianceStatus, CreateComplianceInput, UpdateComplianceInput, Registry, CreateRegistryInput, UpdateRegistryInput, Solped, CreateSolpedInput, UpdateSolpedInput, Memo, CreateMemoInput, UpdateMemoInput } from '../graphql/graphql.types';
import { plainToInstance } from 'class-transformer';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';
import { CreateRegistryDto } from './dto/create-registry.dto';
import { UpdateRegistryDto } from './dto/update-registry.dto';
import { CreateSolpedDto } from './dto/create-solped.dto';
import { UpdateSolpedDto } from './dto/update-solped.dto';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';

@Resolver(() => Compliance)
export class ComplianceResolver {
  constructor(private readonly complianceService: ComplianceService) {}

  @Mutation(() => Compliance)
  create(@Args('createComplianceInput') input: CreateComplianceInput) {
    const dto = plainToInstance(CreateComplianceDto, input);
    return this.complianceService.create(dto);
  }

  @Query(() => [Compliance])
  findAll() {
    return this.complianceService.findAll();
  }

  @Query(() => Compliance, { nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.findOne(id);
  }

  @Query(() => Compliance, { nullable: true })
  getTaskCompliance(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.getTaskCompliance(id);
  }

  @Query(() => [ComplianceStatus])
  getAllComplianceStatuses() {
    return this.complianceService.getAllComplianceStatuses();
  }

  @Mutation(() => Compliance)
  update(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateComplianceInput') input: UpdateComplianceInput,
  ) {
    const dto = plainToInstance(UpdateComplianceDto, input);
    return this.complianceService.update(id, dto);
  }

  @Mutation(() => Compliance)
  remove(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.remove(id);
  }

  @Mutation(() => Registry)
  createRegistry(@Args('createRegistryInput') input: CreateRegistryInput) {
    const dto = plainToInstance(CreateRegistryDto, input);
    return this.complianceService.createRegistry(dto);
  }

  @Mutation(() => Registry)
  updateRegistry(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateRegistryInput') input: UpdateRegistryInput,
  ) {
    const dto = plainToInstance(UpdateRegistryDto, input);
    return this.complianceService.updateRegistry(id, dto);
  }

  @Mutation(() => Registry)
  removeRegistry(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.removeRegistry(id);
  }

  @Query(() => [Registry])
  findAllRegistries() {
    return this.complianceService.findAllRegistries();
  }

  @Query(() => Registry, { nullable: true })
  findOneRegistry(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.findOneRegistry(id);
  }

  @Query(() => [Registry])
  getComplianceRegistries(@Args('complianceId', { type: () => ID }) complianceId: string) {
    return this.complianceService.getComplianceRegistries(complianceId);
  }

  @Mutation(() => Solped)
  createSolped(@Args('createSolpedInput') input: CreateSolpedInput) {
    const dto = plainToInstance(CreateSolpedDto, input);
    return this.complianceService.createSolped(dto);
  }

  @Mutation(() => Solped)
  updateSolped(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateSolpedInput') input: UpdateSolpedInput,
  ) {
    const dto = plainToInstance(UpdateSolpedDto, input);
    return this.complianceService.updateSolped(id, dto);
  }

  @Mutation(() => Solped)
  removeSolped(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.removeSolped(id);
  }

  @Query(() => [Solped])
  findAllSolpeds() {
    return this.complianceService.findAllSolpeds();
  }

  @Query(() => Solped, { nullable: true })
  findOneSolped(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.findOneSolped(id);
  }

  @Query(() => Solped, { nullable: true })
  getRegistrySolped(@Args('registryId', { type: () => ID }) registryId: string) {
    return this.complianceService.getRegistrySolped(registryId);
  }

  @Mutation(() => Memo)
  createMemo(@Args('createMemoInput') input: CreateMemoInput) {
    const dto = plainToInstance(CreateMemoDto, input);
    return this.complianceService.createMemo(dto);
  }

  @Mutation(() => Memo)
  updateMemo(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateMemoInput') input: UpdateMemoInput,
  ) {
    const dto = plainToInstance(UpdateMemoDto, input);
    return this.complianceService.updateMemo(id, dto);
  }

  @Mutation(() => Memo)
  removeMemo(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.removeMemo(id);
  }

  @Query(() => [Memo])
  findAllMemos() {
    return this.complianceService.findAllMemos();
  }

  @Query(() => Memo, { nullable: true })
  findOneMemo(@Args('id', { type: () => ID }) id: string) {
    return this.complianceService.findOneMemo(id);
  }

  @Query(() => Memo, { nullable: true })
  getRegistryMemo(@Args('registryId', { type: () => ID }) registryId: string) {
    return this.complianceService.getRegistryMemo(registryId);
  }

  @Query(() => [Compliance])
  getAppliedCompliances() {
    return this.complianceService.getAppliedCompliances();
  }
} 