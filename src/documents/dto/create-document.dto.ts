import { IsString, IsNumber, IsOptional, Matches } from 'class-validator';
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
  @Matches(/^[^<>:"/\\|?*\x00-\x1f]*$/, {
    message: 'El nombre del archivo contiene caracteres no válidos. Evite usar los siguientes caracteres: < > : " / \\ | ? *'
  })
  nombre_archivo?: string;
} 