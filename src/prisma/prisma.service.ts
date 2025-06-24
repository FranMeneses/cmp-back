import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      console.log('Attempting to connect to database with Managed Identity...');
      console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
      console.log('AZURE_CLIENT_ID configured:', !!process.env.AZURE_CLIENT_ID);
      
      await this.$connect();
      console.log('Database connection established successfully with Managed Identity');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      console.error('DATABASE_URL pattern:', process.env.DATABASE_URL?.substring(0, 50) + '...');
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Database connection closed successfully');
    } catch (error) {
      console.error('Error disconnecting from the database:', error);
      throw error;
    }
  }
} 