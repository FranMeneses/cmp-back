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
import { UploadScalar, DateOnlyScalar } from './graphql/graphql.types';
import { EtlModule } from './etl/etl.module';
import { HistoryModule } from './history/history.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      playground: process.env.NODE_ENV !== 'production',
      introspection: true,
    }),
    PrismaModule,
    TasksModule,
    ComplianceModule,
    SubtasksModule,
    BeneficiariesModule,
    InfoModule,
    DocumentsModule,
    EtlModule,
    HistoryModule,
    UsersModule,
    AuthModule,
    NotificationsModule,
  ],
  providers: [AppService, UploadScalar, DateOnlyScalar],
})
export class AppModule {}
