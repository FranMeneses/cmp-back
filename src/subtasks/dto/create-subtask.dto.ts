import { Field, InputType, Int, ID } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

@InputType()
export class CreateSubtaskDto {
  @Field(() => ID)
  @IsString()
  taskId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

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

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  statusId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  priorityId?: number;
} 