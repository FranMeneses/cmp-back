import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ManagedIdentityCredential } from '@azure/identity';
import * as sql from 'mssql';

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private prismaClient: PrismaClient;
  private isConnected = false;

  // Proxy all PrismaClient properties
  get beneficiario() { return this.ensureConnected().beneficiario; }
  get contacto() { return this.ensureConnected().contacto; }
  get cumplimiento() { return this.ensureConnected().cumplimiento; }
  get cumplimiento_estado() { return this.ensureConnected().cumplimiento_estado; }
  get registro() { return this.ensureConnected().registro; }
  get solped() { return this.ensureConnected().solped; }
  get memo() { return this.ensureConnected().memo; }
  get tarea() { return this.ensureConnected().tarea; }
  get documento() { return this.ensureConnected().documento; }
  get tipo_documento() { return this.ensureConnected().tipo_documento; }
  get historial() { return this.ensureConnected().historial; }
  get info_tarea() { return this.ensureConnected().info_tarea; }
  get origen() { return this.ensureConnected().origen; }
  get inversion() { return this.ensureConnected().inversion; }
  get tipo() { return this.ensureConnected().tipo; }
  get alcance() { return this.ensureConnected().alcance; }
  get interaccion() { return this.ensureConnected().interaccion; }
  get riesgo() { return this.ensureConnected().riesgo; }
  get subtarea() { return this.ensureConnected().subtarea; }
  get prioridad() { return this.ensureConnected().prioridad; }
  get subtarea_estado() { return this.ensureConnected().subtarea_estado; }
  get valle() { return this.ensureConnected().valle; }
  get faena() { return this.ensureConnected().faena; }
  get tarea_estado() { return this.ensureConnected().tarea_estado; }
  get proceso() { return this.ensureConnected().proceso; }

  // Proxy transaction method
  get $transaction() { 
    return this.ensureConnected().$transaction.bind(this.ensureConnected()); 
  }

  // Proxy other important methods
  get $connect() { 
    return this.ensureConnected().$connect.bind(this.ensureConnected()); 
  }

  get $disconnect() { 
    return this.ensureConnected().$disconnect.bind(this.ensureConnected()); 
  }

  get $queryRaw() { 
    return this.ensureConnected().$queryRaw.bind(this.ensureConnected()); 
  }

  get $executeRaw() { 
    return this.ensureConnected().$executeRaw.bind(this.ensureConnected()); 
  }

  private ensureConnected(): PrismaClient {
    if (!this.isConnected || !this.prismaClient) {
      throw new Error('Prisma client not initialized. Call onModuleInit first.');
    }
    return this.prismaClient;
  }

  async onModuleInit() {
    this.logger.log('Initializing Prisma connection with Managed Identity...');
    
    try {
      // Try to establish connection with managed identity
      await this.connectWithManagedIdentity();
      this.logger.log('Successfully connected to database with Managed Identity');
    } catch (error) {
      this.logger.error('Failed to connect with Managed Identity, falling back to connection string', error.message);
      
      // Fallback to regular connection string
      try {
        this.prismaClient = new PrismaClient();
        await this.prismaClient.$connect();
        this.isConnected = true;
        this.logger.log('Successfully connected with connection string fallback');
      } catch (fallbackError) {
        this.logger.error('Failed to connect with fallback method', fallbackError.message);
        throw fallbackError;
      }
    }
  }

  private async connectWithManagedIdentity(): Promise<void> {
    try {
      this.logger.log('Starting Managed Identity authentication process...');
      
      // First, let's try to get token using the Container Apps MSI endpoint directly
      this.logger.log('Attempting to get token from MSI endpoint...');
      
      const tokenUrl = 'http://169.254.169.254/metadata/identity/oauth2/token';
      const params = new URLSearchParams({
        'api-version': '2018-02-01',
        'resource': 'https://database.windows.net/'
      });

      const response = await fetch(`${tokenUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Metadata': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`MSI endpoint returned ${response.status}: ${response.statusText}`);
      }

      const tokenData = await response.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        throw new Error('No access token received from MSI endpoint');
      }

      this.logger.log('Successfully obtained access token from MSI endpoint');

      // Test connection with mssql first using the token
      this.logger.log('Testing connection with mssql driver...');
      const config: sql.config = {
        server: 'servercmp.database.windows.net',
        database: 'basedatoscmp',
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: accessToken,
          },
        },
        options: {
          encrypt: true,
          trustServerCertificate: false,
        },
      };

      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      this.logger.log('Successfully tested connection with mssql driver');
      
      // Test a simple query
      const request = pool.request();
      const result = await request.query('SELECT 1 as test');
      this.logger.log('Test query successful:', result.recordset);
      
      await pool.close();

      // For Prisma, we still need to use the connection string approach
      // since Prisma doesn't support direct token injection
      this.logger.log('Initializing Prisma with Active Directory Default authentication...');
      
      const databaseUrl = `sqlserver://servercmp.database.windows.net:1433;database=basedatoscmp;authentication=Active Directory Default;encrypt=true;trustServerCertificate=false`;
      
      // Override DATABASE_URL environment variable
      process.env.DATABASE_URL = databaseUrl;

      // Create Prisma client
      this.prismaClient = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: ['query', 'info', 'warn', 'error'], // Enable detailed logging
      });

      // Test Prisma connection
      this.logger.log('Testing Prisma connection...');
      await this.prismaClient.$connect();
      this.isConnected = true;

      this.logger.log('Prisma client successfully initialized with Managed Identity');

    } catch (error) {
      this.logger.error('Error in connectWithManagedIdentity:', error.message);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
} 