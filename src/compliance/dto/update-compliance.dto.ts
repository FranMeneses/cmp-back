import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateComplianceDto {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_subtarea?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_cumplimiento_estado?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  aplica?: number;
} 