import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateComplianceDto {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  id_subtarea: number;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  id_cumplimiento_estado: number;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  aplica: number;
} 