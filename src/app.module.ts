import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { ComplianceModule } from './compliance/compliance.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    PrismaModule,
    TasksModule,
    ComplianceModule,
    SubtasksModule,
    BeneficiariesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
