import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
      console.log('MSI_ENDPOINT configured:', !!process.env.MSI_ENDPOINT);
      console.log('IDENTITY_ENDPOINT configured:', !!process.env.IDENTITY_ENDPOINT);
      
      // Intentar obtener token usando Container Apps MSI endpoint
      console.log('Getting access token via MSI endpoint...');
      const token = await this.getAccessTokenViaMSI();
      console.log('Successfully obtained access token for SQL Database');
      
      // Construir cadena de conexión con el token
      const connectionString = `sqlserver://servercmp.database.windows.net:1433;database=basedatoscmp;authentication=ActiveDirectoryAccessToken;accessToken=${token};encrypt=true;trustServerCertificate=false`;
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

  private async getAccessTokenViaMSI(): Promise<string> {
    const msiEndpoint = process.env.MSI_ENDPOINT || process.env.IDENTITY_ENDPOINT;
    const msiSecret = process.env.MSI_SECRET || process.env.IDENTITY_HEADER;
    
    if (!msiEndpoint) {
      throw new Error('MSI endpoint not available');
    }

    const resource = 'https://database.windows.net/';
    const apiVersion = '2019-08-01';
    const clientId = process.env.AZURE_CLIENT_ID;
    
    let url = `${msiEndpoint}?resource=${encodeURIComponent(resource)}&api-version=${apiVersion}`;
    if (clientId) {
      url += `&client_id=${encodeURIComponent(clientId)}`;
    }

    const headers: Record<string, string> = {};
    if (msiSecret) {
      headers['X-IDENTITY-HEADER'] = msiSecret;
    }

    console.log('Making MSI request to:', url.replace(msiSecret || '', '***'));
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MSI request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.access_token;
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