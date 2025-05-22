import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { CreateDocumentDto } from './create-document.dto';

@ArgsType()
export class UploadDocumentDto {
  @Field(() => CreateDocumentDto)
  @IsNotEmpty()
  input: CreateDocumentDto;
} 