import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBeneficiaryDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  legalName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  rut?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  entityType?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  representative?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  hasLegalPersonality?: boolean;
} 