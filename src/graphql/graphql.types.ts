import { Field, ID, ObjectType, InputType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Valley {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class Faena {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class TaskStatus {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class Beneficiary {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  legalName?: string;

  @Field({ nullable: true })
  rut?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  entityType?: string;

  @Field({ nullable: true })
  representative?: string;

  @Field({ nullable: true })
  hasLegalPersonality?: boolean;

  @Field(() => [Contact], { nullable: true })
  contacts?: Contact[];

  @Field(() => [Subtask], { nullable: true })
  subtasks?: Subtask[];
}

@ObjectType()
export class Contact {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  position?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => Beneficiary, { nullable: true })
  beneficiary?: Beneficiary;
}

@InputType()
export class CreateBeneficiaryInput {
  @Field({ nullable: true })
  legalName?: string;

  @Field({ nullable: true })
  rut?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  entityType?: string;

  @Field({ nullable: true })
  representative?: string;

  @Field({ nullable: true })
  hasLegalPersonality?: boolean;
}

@InputType()
export class UpdateBeneficiaryInput {
  @Field({ nullable: true })
  legalName?: string;

  @Field({ nullable: true })
  rut?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  entityType?: string;

  @Field({ nullable: true })
  representative?: string;

  @Field({ nullable: true })
  hasLegalPersonality?: boolean;
}

@InputType()
export class CreateContactInput {
  @Field(() => ID)
  beneficiaryId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  position?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}

@InputType()
export class UpdateContactInput {
  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  position?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}

@ObjectType()
export class SubtaskStatus {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  percentage: number;
}

@ObjectType()
export class Priority {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class Subtask {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  taskId: string;

  @Field(() => Int, { nullable: true })
  number?: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  budget?: number;

  @Field(() => Int, { nullable: true })
  expense?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  finalDate?: Date;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Int, { nullable: true })
  priorityId?: number;

  @Field(() => Beneficiary, { nullable: true })
  beneficiary?: Beneficiary;

  @Field(() => SubtaskStatus, { nullable: true })
  status?: SubtaskStatus;

  @Field(() => Priority, { nullable: true })
  priority?: Priority;
}

@InputType()
export class CreateSubtaskInput {
  @Field(() => ID)
  taskId: string;

  @Field(() => Int, { nullable: true })
  number?: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  budget?: number;

  @Field(() => Int, { nullable: true })
  expense?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  finalDate?: Date;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Int, { nullable: true })
  priorityId?: number;
}

@InputType()
export class UpdateSubtaskInput {
  @Field(() => ID)
  taskId: string;

  @Field(() => Int, { nullable: true })
  number?: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  budget?: number;

  @Field(() => Int, { nullable: true })
  expense?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  finalDate?: Date;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Int, { nullable: true })
  priorityId?: number;
}

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  valleyId?: number;

  @Field(() => Int, { nullable: true })
  faenaId?: number;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Valley, { nullable: true })
  valley?: Valley;

  @Field(() => Faena, { nullable: true })
  faena?: Faena;

  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => [Subtask], { nullable: true })
  subtasks?: Subtask[];
}

@InputType()
export class CreateTaskInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  valleyId?: number;

  @Field(() => Int, { nullable: true })
  faenaId?: number;

  @Field(() => Int, { nullable: true })
  statusId?: number;
}

@InputType()
export class UpdateTaskInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  valleyId?: number;

  @Field(() => Int, { nullable: true })
  faenaId?: number;

  @Field(() => Int, { nullable: true })
  statusId?: number;
}

@ObjectType()
export class Compliance {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  subtaskId: string;

  @Field(() => Int)
  statusId: number;

  @Field()
  applies: boolean;
}

@InputType()
export class CreateComplianceInput {
  @Field(() => ID)
  subtaskId: string;

  @Field(() => Int)
  statusId: number;

  @Field()
  applies: boolean;
}

@InputType()
export class UpdateComplianceInput {
  @Field(() => ID, { nullable: true })
  subtaskId?: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field({ nullable: true })
  applies?: boolean;
} 