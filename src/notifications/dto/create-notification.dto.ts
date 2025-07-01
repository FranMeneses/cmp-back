import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateNotificationDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id_usuario: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  id_tarea?: string;
} 