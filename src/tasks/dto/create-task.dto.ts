import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateTaskDto {
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
  valleyId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  faenaId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  processId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  statusId?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  applies?: boolean;
} 