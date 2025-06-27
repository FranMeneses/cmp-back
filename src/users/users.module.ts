import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { EmailValidationService } from '../auth/email-validation.service';

@Module({
  imports: [PrismaModule, HttpModule],
  providers: [UsersService, UsersResolver, EmailValidationService],
  exports: [UsersService],
})
export class UsersModule {} 