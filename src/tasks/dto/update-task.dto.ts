import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateTaskDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  nombre?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_valle?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_faena?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id_estado?: number;
} 