import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DefaultAzureCredential } from '@azure/identity';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    try {
      console.log('Attempting to connect to database with Managed Identity...');
      console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
      console.log('AZURE_CLIENT_ID configured:', !!process.env.AZURE_CLIENT_ID);
      
      // Intentar obtener token de acceso usando Managed Identity
      const credential = new DefaultAzureCredential();
      const tokenResponse = await credential.getToken('https://database.windows.net/');
      console.log('Successfully obtained access token for SQL Database');
      
      // Construir cadena de conexión con el token
      const connectionString = `sqlserver://servercmp.database.windows.net:1433;database=basedatoscmp;authentication=ActiveDirectoryAccessToken;accessToken=${tokenResponse.token};encrypt=true;trustServerCertificate=false`;
      
      // Actualizar la configuración de Prisma con el token
      this.$disconnect();
      const prismaWithToken = new PrismaClient({
        datasources: {
          db: {
            url: connectionString,
          },
        },
        log: ['query', 'info', 'warn', 'error'],
        errorFormat: 'pretty',
      });
      
      // Copiar las propiedades del cliente con token
      Object.setPrototypeOf(this, prismaWithToken);
      Object.assign(this, prismaWithToken);
      
      await this.$connect();
      console.log('Database connection established successfully with Managed Identity token');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      console.error('DATABASE_URL pattern:', process.env.DATABASE_URL?.substring(0, 50) + '...');
      
      // Fallback al método original si falla el token
      console.log('Falling back to original connection method...');
      await this.$connect();
      console.log('Database connection established with fallback method');
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