import { Field, ID, ObjectType, InputType, Int, Float, Scalar } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload/GraphQLUpload.js';

@ObjectType()
export class Valley {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class Origin {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class Investment {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  line?: string;
}

@ObjectType()
export class Type {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class Scope {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class Interaction {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  operation?: string;
}

@ObjectType()
export class Risk {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  type?: string;
}

@ObjectType()
export class Process {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}

@ObjectType()
export class MonthlyBudget {
  @Field()
  month: string;

  @Field(() => Float)
  budget: number;
}

@ObjectType()
export class MonthlyExpense {
  @Field()
  month: string;

  @Field(() => Float)
  expense: number;
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
export class ComplianceStatus {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  days?: number;
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
  processId?: number;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Valley, { nullable: true })
  valley?: Valley;

  @Field(() => Faena, { nullable: true })
  faena?: Faena;

  @Field(() => Process, { nullable: true })
  process?: Process;

  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => [Subtask], { nullable: true })
  subtasks?: Subtask[];

  @Field(() => [Compliance], { nullable: true })
  compliances?: Compliance[];
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
  processId?: number;

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
  processId?: number;

  @Field(() => Int, { nullable: true })
  statusId?: number;
}

@ObjectType()
export class InfoTask {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  taskId: string;

  @Field(() => Int, { nullable: true })
  originId?: number;

  @Field(() => Int, { nullable: true })
  investmentId?: number;

  @Field(() => Int, { nullable: true })
  typeId?: number;

  @Field(() => Int, { nullable: true })
  scopeId?: number;

  @Field(() => Int, { nullable: true })
  interactionId?: number;

  @Field(() => Int, { nullable: true })
  riskId?: number;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => Origin, { nullable: true })
  origin?: Origin;

  @Field(() => Investment, { nullable: true })
  investment?: Investment;

  @Field(() => Type, { nullable: true })
  type?: Type;

  @Field(() => Scope, { nullable: true })
  scope?: Scope;

  @Field(() => Interaction, { nullable: true })
  interaction?: Interaction;

  @Field(() => Risk, { nullable: true })
  risk?: Risk;
}

@InputType()
export class CreateInfoTaskInput {
  @Field(() => ID)
  taskId: string;

  @Field(() => Int, { nullable: true })
  originId?: number;

  @Field(() => Int, { nullable: true })
  investmentId?: number;

  @Field(() => Int, { nullable: true })
  typeId?: number;

  @Field(() => Int, { nullable: true })
  scopeId?: number;

  @Field(() => Int, { nullable: true })
  interactionId?: number;

  @Field(() => Int, { nullable: true })
  riskId?: number;
}

@InputType()
export class UpdateInfoTaskInput {
  @Field(() => ID, { nullable: true })
  taskId?: string;

  @Field(() => Int, { nullable: true })
  originId?: number;

  @Field(() => Int, { nullable: true })
  investmentId?: number;

  @Field(() => Int, { nullable: true })
  typeId?: number;

  @Field(() => Int, { nullable: true })
  scopeId?: number;

  @Field(() => Int, { nullable: true })
  interactionId?: number;

  @Field(() => Int, { nullable: true })
  riskId?: number;
}

@ObjectType()
export class Compliance {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  taskId: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field({ nullable: true })
  applies?: boolean;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => ComplianceStatus, { nullable: true })
  status?: ComplianceStatus;

  @Field(() => [Registry], { nullable: true })
  registries?: Registry[];
}

@InputType()
export class CreateComplianceInput {
  @Field(() => ID)
  taskId: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field({ nullable: true })
  applies?: boolean;
}

@InputType()
export class UpdateComplianceInput {
  @Field(() => ID, { nullable: true })
  taskId?: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field({ nullable: true })
  applies?: boolean;
}

@ObjectType()
export class Registry {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  complianceId: string;

  @Field({ nullable: true })
  hes?: boolean;

  @Field({ nullable: true })
  hem?: boolean;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Compliance, { nullable: true })
  compliance?: Compliance;

  @Field(() => [Memo], { nullable: true })
  memos?: Memo[];

  @Field(() => [Solped], { nullable: true })
  solpeds?: Solped[];
}

@InputType()
export class CreateRegistryInput {
  @Field(() => ID)
  complianceId: string;

  @Field({ nullable: true })
  hes?: boolean;

  @Field({ nullable: true })
  hem?: boolean;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@InputType()
export class UpdateRegistryInput {
  @Field(() => ID, { nullable: true })
  complianceId?: string;

  @Field({ nullable: true })
  hes?: boolean;

  @Field({ nullable: true })
  hem?: boolean;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@ObjectType()
export class Memo {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  registryId: string;

  @Field(() => Int, { nullable: true })
  value?: number;

  @Field(() => Registry, { nullable: true })
  registry?: Registry;
}

@InputType()
export class CreateMemoInput {
  @Field(() => ID)
  registryId: string;

  @Field(() => Int, { nullable: true })
  value?: number;
}

@InputType()
export class UpdateMemoInput {
  @Field(() => ID, { nullable: true })
  registryId?: string;

  @Field(() => Int, { nullable: true })
  value?: number;
}

@ObjectType()
export class Solped {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  registryId: string;

  @Field(() => Int, { nullable: true })
  ceco?: number;

  @Field(() => Int, { nullable: true })
  account?: number;

  @Field(() => Int, { nullable: true })
  value?: number;

  @Field(() => Registry, { nullable: true })
  registry?: Registry;
}

@InputType()
export class CreateSolpedInput {
  @Field(() => ID)
  registryId: string;

  @Field(() => Int, { nullable: true })
  ceco?: number;

  @Field(() => Int, { nullable: true })
  account?: number;

  @Field(() => Int, { nullable: true })
  value?: number;
}

@InputType()
export class UpdateSolpedInput {
  @Field(() => ID, { nullable: true })
  registryId?: string;

  @Field(() => Int, { nullable: true })
  ceco?: number;

  @Field(() => Int, { nullable: true })
  account?: number;

  @Field(() => Int, { nullable: true })
  value?: number;
}

@ObjectType()
export class TipoDocumento {
  @Field(() => Int)
  id_tipo_documento: number;

  @Field(() => String, { nullable: true })
  tipo_documento?: string;
}

@ObjectType()
export class Document {
  @Field(() => ID)
  id_documento: string;

  @Field(() => String, { nullable: true })
  id_tarea?: string;

  @Field(() => String, { nullable: true })
  id_subtarea?: string;

  @Field(() => Int)
  tipo_documento: number;

  @Field(() => String, { nullable: true })
  ruta?: string;

  @Field(() => Date, { nullable: true })
  fecha_carga?: Date;

  @Field(() => String, { nullable: true })
  nombre_archivo?: string;

  @Field(() => Task, { nullable: true })
  tarea?: Task;

  @Field(() => Subtask, { nullable: true })
  subtarea?: Subtask;

  @Field(() => TipoDocumento)
  tipo_doc: TipoDocumento;
}

@InputType()
export class CreateDocumentInput {
  @Field(() => Int)
  tipo_documento: number;

  @Field(() => String)
  ruta: string;

  @Field(() => String, { nullable: true })
  id_tarea?: string;

  @Field(() => String, { nullable: true })
  id_subtarea?: string;

  @Field(() => String, { nullable: true })
  nombre_archivo?: string;
}

@InputType()
export class UpdateDocumentInput {
  @Field(() => Int, { nullable: true })
  tipo_documento?: number;

  @Field(() => String, { nullable: true })
  id_tarea?: string;

  @Field(() => String, { nullable: true })
  id_subtarea?: string;

  @Field(() => String, { nullable: true })
  nombre_archivo?: string;
}

@Scalar('Upload')
export class UploadScalar {
  description = 'File upload scalar type';
  private readonly graphQLUploadInstance = GraphQLUpload;

  parseValue(value: any) {
    return this.graphQLUploadInstance.parseValue(value);
  }

  serialize(value: any) {
    return this.graphQLUploadInstance.serialize(value);
  }

  parseLiteral(ast: any) {
    return this.graphQLUploadInstance.parseLiteral(ast);
  }
}