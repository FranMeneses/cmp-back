import { IsString, IsNumber, IsOptional } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateDocumentDto {
  @Field(() => Int)
  @IsNumber()
  tipo_documento: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id_tarea?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id_subtarea?: string;
} 