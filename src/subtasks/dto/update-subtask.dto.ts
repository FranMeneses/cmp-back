import { Field, InputType, Int, ID } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

@InputType()
export class UpdateSubtaskDto {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  taskId?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  number?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  statusId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  priorityId?: number;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  beneficiaryId?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  expense?: number;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  finalDate?: Date;
} 