import { PartialType } from '@nestjs/mapped-types';
import { CreateSolpedDto } from './create-solped.dto';

export class UpdateSolpedDto extends PartialType(CreateSolpedDto) {} 