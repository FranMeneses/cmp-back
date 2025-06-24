import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DefaultAzureCredential } from '@azure/identity';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private initialized = false;

  constructor() {
    // Crear instancia mínima sin conectar
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    if (this.initialized) return;
    
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
      
      // Crear nuevo cliente con token y reemplazar el actual
      const newClient = new PrismaClient({
        datasources: {
          db: {
            url: connectionString,
          },
        },
        log: ['query', 'info', 'warn', 'error'],
        errorFormat: 'pretty',
      });
      
      await newClient.$connect();
      console.log('Database connection established successfully with Managed Identity token');
      
      // Reemplazar la configuración interna del cliente actual
      Object.setPrototypeOf(this, newClient);
      Object.assign(this, newClient);
      
      this.initialized = true;
      
    } catch (error) {
      console.error('Error with Managed Identity approach:', error);
      
      // Fallback al método original si falla el token
      console.log('Falling back to original connection method...');
      try {
        await this.$connect();
        console.log('Database connection established with fallback method');
        this.initialized = true;
      } catch (fallbackError) {
        console.error('Fallback connection also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async onModuleDestroy() {
    try {
      if (this.initialized) {
        await this.$disconnect();
        console.log('Database connection closed successfully');
      }
    } catch (error) {
      console.error('Error disconnecting from the database:', error);
      throw error;
    }
  }
} 