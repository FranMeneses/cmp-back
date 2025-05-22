import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { ComplianceModule } from './compliance/compliance.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { InfoModule } from './info/info.module';
import { DocumentsModule } from './documents/documents.module';
import { UploadScalar } from './graphql/graphql.types';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      playground: true,
      introspection: true,
    }),
    PrismaModule,
    TasksModule,
    ComplianceModule,
    SubtasksModule,
    BeneficiariesModule,
    InfoModule,
    DocumentsModule,
  ],
  providers: [AppService, UploadScalar],
})
export class AppModule {}
