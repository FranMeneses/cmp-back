import { IsString, IsNumber, IsOptional } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateDocumentDto {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  tipo_documento?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id_tarea?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  nombre_archivo?: string;
} 