import { Field, ID, ObjectType, InputType, Int, Float, Scalar } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload/GraphQLUpload.js';
import { IsEmail, IsNotEmpty, IsString, IsInt, IsOptional, MinLength, IsBoolean, Matches } from 'class-validator';

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

  @Field(() => [Task], { nullable: true })
  tasks?: Task[];
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

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  budget?: number;

  @Field(() => Int, { nullable: true })
  expense?: number;

  @Field(() => DateOnlyScalar, { nullable: true })
  startDate?: Date;

  @Field(() => DateOnlyScalar, { nullable: true })
  endDate?: Date;

  @Field(() => DateOnlyScalar, { nullable: true })
  finalDate?: Date;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Int, { nullable: true })
  priorityId?: number;

  @Field(() => SubtaskStatus, { nullable: true })
  status?: SubtaskStatus;

  @Field(() => Priority, { nullable: true })
  priority?: Priority;
}

@InputType()
export class CreateSubtaskInput {
  @Field(() => ID)
  taskId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  budget?: number;

  @Field(() => Int, { nullable: true })
  expense?: number;

  @Field(() => DateOnlyScalar, { nullable: true })
  startDate?: Date;

  @Field(() => DateOnlyScalar, { nullable: true })
  endDate?: Date;

  @Field(() => DateOnlyScalar, { nullable: true })
  finalDate?: Date;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Int, { nullable: true })
  priorityId?: number;
}

@InputType()
export class UpdateSubtaskInput {
  @Field(() => ID)
  taskId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  budget?: number;

  @Field(() => Int, { nullable: true })
  expense?: number;

  @Field(() => DateOnlyScalar, { nullable: true })
  startDate?: Date;

  @Field(() => DateOnlyScalar, { nullable: true })
  endDate?: Date;

  @Field(() => DateOnlyScalar, { nullable: true })
  finalDate?: Date;

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

  @Field({ nullable: true })
  applies?: boolean;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;

  @Field(() => Valley, { nullable: true })
  valley?: Valley;

  @Field(() => Faena, { nullable: true })
  faena?: Faena;

  @Field(() => Process, { nullable: true })
  process?: Process;

  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => Beneficiary, { nullable: true })
  beneficiary?: Beneficiary;

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

  @Field({ nullable: true })
  applies?: boolean;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;
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

  @Field({ nullable: true })
  applies?: boolean;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;
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

  @Field()
  updatedAt: Date;

  @Field(() => Int, { nullable: true })
  valor?: number;

  @Field(() => Int, { nullable: true })
  ceco?: number;

  @Field(() => Int, { nullable: true })
  cuenta?: number;

  @Field(() => Int, { nullable: true })
  solpedMemoSap?: number;

  @Field(() => Int, { nullable: true })
  hesHemSap?: number;

  @Field(() => Boolean, { nullable: true })
  listo?: boolean;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => ComplianceStatus, { nullable: true })
  status?: ComplianceStatus;
}

@InputType()
export class CreateComplianceInput {
  @Field(() => ID)
  taskId: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;
}

@InputType()
export class UpdateComplianceInput {
  @Field(() => ID, { nullable: true })
  taskId?: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Int, { nullable: true })
  valor?: number;

  @Field(() => Int, { nullable: true })
  ceco?: number;

  @Field(() => Int, { nullable: true })
  cuenta?: number;

  @Field(() => Int, { nullable: true })
  solpedMemoSap?: number;

  @Field(() => Int, { nullable: true })
  hesHemSap?: number;

  @Field(() => Boolean, { nullable: true })
  listo?: boolean;
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

  @Field(() => Int)
  tipo_documento: number;

  @Field(() => String, { nullable: true })
  ruta?: string;

  @Field(() => DateOnlyScalar, { nullable: true })
  fecha_carga?: Date;

  @Field(() => String, { nullable: true })
  nombre_archivo?: string;

  @Field(() => Task, { nullable: true })
  tarea?: Task;

  @Field(() => TipoDocumento)
  tipo_doc: TipoDocumento;
}

@InputType()
export class CreateDocumentInput {
  @Field(() => Int)
  @IsInt()
  tipo_documento: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  ruta: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id_tarea?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @Matches(/^[^<>:"/\\|?*\x00-\x1f]*$/, {
    message: 'El nombre del archivo contiene caracteres no válidos. Evite usar los siguientes caracteres: < > : " / \\ | ? *'
  })
  nombre_archivo?: string;
}

@InputType()
export class UpdateDocumentInput {
  @Field(() => Int, { nullable: true })
  tipo_documento?: number;

  @Field(() => String, { nullable: true })
  id_tarea?: string;

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

@Scalar('DateOnly')
export class DateOnlyScalar {
  description = 'Date scalar type (without time)';

  private readonly graphQLDateOnlyInstance = new GraphQLScalarType({
    name: 'DateOnly',
    description: 'Date scalar type (without time)',
    parseValue(value: string) {
      return new Date(value);
    },
    serialize(value: Date) {
      return value.toISOString().split('T')[0];
    },
    parseLiteral(ast: any) {
      if (ast.kind === 'StringValue') {
        return new Date(ast.value);
      }
      return null;
    },
  });

  parseValue(value: any) {
    return this.graphQLDateOnlyInstance.parseValue(value);
  }

  serialize(value: any) {
    return this.graphQLDateOnlyInstance.serialize(value);
  }

  parseLiteral(ast: any) {
    return this.graphQLDateOnlyInstance.parseLiteral(ast);
  }
}

@ObjectType()
export class History {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  processId?: number;

  @Field(() => DateOnlyScalar, { nullable: true })
  finalDate?: Date;

  @Field(() => Int, { nullable: true })
  totalExpense?: number;

  @Field(() => Int, { nullable: true })
  valleyId?: number;

  @Field(() => Int, { nullable: true })
  faenaId?: number;

  @Field(() => Int, { nullable: true })
  solpedMemoSap?: number;

  @Field(() => Int, { nullable: true })
  hesHemSap?: number;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;

  @Field(() => Process, { nullable: true })
  process?: Process;

  @Field(() => Valley, { nullable: true })
  valley?: Valley;

  @Field(() => Faena, { nullable: true })
  faena?: Faena;

  @Field(() => Beneficiary, { nullable: true })
  beneficiary?: Beneficiary;

  @Field(() => [HistoryDoc], { nullable: true })
  documents?: HistoryDoc[];
}

@ObjectType()
export class HistoryDoc {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  historyId: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field(() => Int)
  documentTypeId: number;

  @Field({ nullable: true })
  path?: string;

  @Field(() => DateOnlyScalar, { nullable: true })
  uploadDate?: Date;

  @Field(() => History)
  history: History;

  @Field(() => TipoDocumento)
  documentType: TipoDocumento;
}

@InputType()
export class CreateHistoryInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  processId?: number;

  @Field(() => DateOnlyScalar, { nullable: true })
  finalDate?: Date;

  @Field(() => Int, { nullable: true })
  totalExpense?: number;

  @Field(() => Int, { nullable: true })
  valleyId?: number;

  @Field(() => Int, { nullable: true })
  faenaId?: number;

  @Field(() => Int, { nullable: true })
  solpedMemoSap?: number;

  @Field(() => Int, { nullable: true })
  hesHemSap?: number;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;
}

@InputType()
export class UpdateHistoryInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  processId?: number;

  @Field(() => DateOnlyScalar, { nullable: true })
  finalDate?: Date;

  @Field(() => Int, { nullable: true })
  totalExpense?: number;

  @Field(() => Int, { nullable: true })
  valleyId?: number;

  @Field(() => Int, { nullable: true })
  faenaId?: number;

  @Field(() => Int, { nullable: true })
  solpedMemoSap?: number;

  @Field(() => Int, { nullable: true })
  hesHemSap?: number;

  @Field(() => ID, { nullable: true })
  beneficiaryId?: string;
}

@InputType()
export class CreateHistoryDocInput {
  @Field(() => ID)
  historyId: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field(() => Int)
  documentTypeId: number;

  @Field({ nullable: true })
  path?: string;

  @Field(() => DateOnlyScalar, { nullable: true })
  uploadDate?: Date;
}

@InputType()
export class UpdateHistoryDocInput {
  @Field(() => ID, { nullable: true })
  historyId?: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field(() => Int, { nullable: true })
  documentTypeId?: number;

  @Field({ nullable: true })
  path?: string;

  @Field(() => DateOnlyScalar, { nullable: true })
  uploadDate?: Date;
}

@ObjectType()
export class Rol {
  @Field(() => Int)
  id_rol: number;

  @Field()
  nombre: string;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id_usuario: string;

  @Field()
  email: string;

  @Field()
  full_name: string;

  @Field(() => Int)
  id_rol: number;

  @Field({ nullable: true })
  organization?: string;

  @Field()
  is_active: boolean;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field({ nullable: true })
  last_login?: Date;

  @Field(() => Rol)
  rol: Rol;
}

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  id_rol?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  organization?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  full_name?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  id_rol?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  organization?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  access_token: string;

  @Field(() => User)
  user: User;
}

// Password Reset Types
@InputType()
export class RequestPasswordResetInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  frontendUrl: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}

@ObjectType()
export class PasswordResetResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class TokenValidationResponse {
  @Field()
  valid: boolean;

  @Field({ nullable: true })
  message?: string;
}

// Notification Types
@ObjectType()
export class Notification {
  @Field(() => ID)
  id_notificacion: string;

  @Field(() => ID)
  id_usuario: string;

  @Field()
  titulo: string;

  @Field()
  mensaje: string;

  @Field()
  leida: boolean;

  @Field({ nullable: true })
  read_at?: Date;

  @Field()
  created_at: Date;

  @Field(() => ID, { nullable: true })
  id_tarea?: string;
}

@InputType()
export class CreateNotificationInput {
  @Field(() => ID)
  @IsNotEmpty()
  id_usuario: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  id_tarea?: string;
}

@ObjectType()
export class NotificationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}