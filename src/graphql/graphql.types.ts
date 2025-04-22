import { Field, ID, ObjectType, InputType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  budget?: number;

  @Field(() => Float, { nullable: true })
  expense?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  finalDate?: Date;

  @Field(() => Int)
  status: number;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field(() => Int, { nullable: true })
  valley?: number;

  @Field(() => Int, { nullable: true })
  faena?: number;
}

@InputType()
export class CreateTaskInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  budget?: number;

  @Field(() => Float, { nullable: true })
  expense?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  finalDate?: Date;

  @Field(() => Int)
  status: number;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field(() => Int, { nullable: true })
  valley?: number;

  @Field(() => Int, { nullable: true })
  faena?: number;
}

@InputType()
export class UpdateTaskInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  budget?: number;

  @Field(() => Float, { nullable: true })
  expense?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  finalDate?: Date;

  @Field(() => Int, { nullable: true })
  status?: number;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field(() => Int, { nullable: true })
  valley?: number;

  @Field(() => Int, { nullable: true })
  faena?: number;
}

@ObjectType()
export class Subtask {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  taskId: string;

  @Field(() => Int)
  number: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  budget: number;

  @Field(() => Float)
  expense: number;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  finalDate: Date;

  @Field(() => ID)
  beneficiaryId: string;

  @Field(() => Int)
  statusId: number;

  @Field(() => Int)
  priorityId: number;
}

@InputType()
export class CreateSubtaskInput {
  @Field(() => ID)
  taskId: string;

  @Field(() => Int)
  number: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  budget: number;

  @Field(() => Float)
  expense: number;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  finalDate: Date;

  @Field(() => ID)
  beneficiaryId: string;

  @Field(() => Int)
  statusId: number;

  @Field(() => Int)
  priorityId: number;
}

@InputType()
export class UpdateSubtaskInput {
  @Field(() => ID, { nullable: true })
  taskId?: string;

  @Field(() => Int, { nullable: true })
  number?: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  budget?: number;

  @Field(() => Float, { nullable: true })
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
export class Beneficiary {
  @Field(() => ID)
  id: string;

  @Field()
  legalName: string;

  @Field()
  rut: string;

  @Field()
  address: string;

  @Field()
  entityType: string;

  @Field()
  representative: string;

  @Field()
  hasLegalPersonality: boolean;
}

@InputType()
export class CreateBeneficiaryInput {
  @Field()
  legalName: string;

  @Field()
  rut: string;

  @Field()
  address: string;

  @Field()
  entityType: string;

  @Field()
  representative: string;

  @Field()
  hasLegalPersonality: boolean;
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