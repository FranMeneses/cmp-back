import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DefaultAzureCredential } from '@azure/identity';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: PrismaClient;

  async onModuleInit() {
    try {
      console.log('Attempting to connect to database with Managed Identity...');
      console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
      console.log('AZURE_CLIENT_ID configured:', !!process.env.AZURE_CLIENT_ID);
      
      // Intentar obtener token de acceso usando Managed Identity
      console.log('Getting access token...');
      const credential = new DefaultAzureCredential();
      const tokenResponse = await credential.getToken('https://database.windows.net/');
      console.log('Successfully obtained access token for SQL Database');
      
      // Construir cadena de conexión con el token
      const connectionString = `sqlserver://servercmp.database.windows.net:1433;database=basedatoscmp;authentication=ActiveDirectoryAccessToken;accessToken=${tokenResponse.token};encrypt=true;trustServerCertificate=false`;
      console.log('Connection string built with token');
      
      // Crear PrismaClient con el token
      this.prismaClient = new PrismaClient({
        datasources: {
          db: {
            url: connectionString,
          },
        },
        log: ['query', 'info', 'warn', 'error'],
        errorFormat: 'pretty',
      });
      
      await this.prismaClient.$connect();
      console.log('Database connection established successfully with Managed Identity token');
      
      // Copiar todos los métodos de Prisma al servicio
      return this.copyPrismaMethods();
      
    } catch (error) {
      console.error('Error with Managed Identity approach:', error);
      
      // Fallback al método original si falla el token
      console.log('Falling back to original connection method...');
      try {
        this.prismaClient = new PrismaClient({
          log: ['query', 'info', 'warn', 'error'],
          errorFormat: 'pretty',
        });
        await this.prismaClient.$connect();
        console.log('Database connection established with fallback method');
        return this.copyPrismaMethods();
      } catch (fallbackError) {
        console.error('Fallback connection also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async onModuleDestroy() {
    try {
      if (this.prismaClient) {
        await this.prismaClient.$disconnect();
        console.log('Database connection closed successfully');
      }
    } catch (error) {
      console.error('Error disconnecting from the database:', error);
      throw error;
    }
  }

  private copyPrismaMethods() {
    // Copiar todos los métodos y propiedades de PrismaClient al servicio
    const prismaPrototype = Object.getPrototypeOf(this.prismaClient);
    const prismaPropertyNames = Object.getOwnPropertyNames(prismaPrototype);
    
    for (const propertyName of prismaPropertyNames) {
      if (propertyName !== 'constructor') {
        (this as any)[propertyName] = (this.prismaClient as any)[propertyName].bind(this.prismaClient);
      }
    }

    // Copiar las propiedades de instancia
    Object.keys(this.prismaClient).forEach(key => {
      (this as any)[key] = (this.prismaClient as any)[key];
    });

    // Especialmente importantes para Prisma
    (this as any).$connect = this.prismaClient.$connect.bind(this.prismaClient);
    (this as any).$disconnect = this.prismaClient.$disconnect.bind(this.prismaClient);
    (this as any).$transaction = this.prismaClient.$transaction.bind(this.prismaClient);
  }
} 