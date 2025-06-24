import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as sql from 'mssql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private nativePool: sql.ConnectionPool | null = null;
  private connectionString: string = '';

  constructor() {
    // No inicializar Prisma hasta tener la conexión
    super();
  }

  async onModuleInit() {
    try {
      console.log('Setting up hybrid SQL connection...');
      console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
      console.log('AZURE_CLIENT_ID configured:', !!process.env.AZURE_CLIENT_ID);
      
      // Paso 1: Establecer conexión con driver nativo usando Managed Identity
      console.log('Connecting with native mssql driver and Managed Identity...');
      await this.connectWithNativeDriver();
      console.log('Native connection established successfully');
      
      // Paso 2: Usar Prisma con la conexión establecida
      console.log('Initializing Prisma with authenticated connection...');
      await this.initializePrisma();
      console.log('Prisma initialized successfully');
      
    } catch (error) {
      console.error('Error in hybrid connection setup:', error);
      
      // Fallback: intentar conexión tradicional con Prisma
      console.log('Attempting fallback connection...');
      try {
        await this.$connect();
        console.log('Fallback connection successful');
      } catch (fallbackError) {
        console.error('Fallback connection also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  private async connectWithNativeDriver(): Promise<void> {
    const config: sql.config = {
      server: 'servercmp.database.windows.net',
      database: 'basedatoscmp',
      authentication: {
        type: 'azure-active-directory-msi-vm' as any, // Container Apps usa este tipo
      },
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    console.log('Creating connection pool with Managed Identity...');
    this.nativePool = new sql.ConnectionPool(config);
    
    // Conectar y verificar
    await this.nativePool.connect();
    console.log('Native connection pool created and connected');
    
    // Hacer una query de prueba para confirmar que funciona
    const request = this.nativePool.request();
    const result = await request.query('SELECT @@VERSION as version');
    console.log('Connection verified with SQL Server version:', result.recordset[0].version.substring(0, 50) + '...');
  }

  private async initializePrisma(): Promise<void> {
    // Con la conexión nativa establecida, ahora podemos usar Prisma
    // Prisma va a usar la misma autenticación que ya establecimos
    
    // Construir URL para Prisma que use Managed Identity
    this.connectionString = `sqlserver://servercmp.database.windows.net:1433;database=basedatoscmp;authentication=ActiveDirectoryMsi;encrypt=true;trustServerCertificate=false`;
    
    console.log('Connecting Prisma with Managed Identity URL...');
    
    // Crear nuevo cliente Prisma con la configuración correcta
    const newPrismaClient = new PrismaClient({
      datasources: {
        db: {
          url: this.connectionString,
        },
      },
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });

    await newPrismaClient.$connect();
    
    // Reemplazar este servicio con el nuevo cliente
    Object.setPrototypeOf(this, newPrismaClient);
    Object.assign(this, newPrismaClient);
    
    console.log('Prisma successfully connected with Managed Identity');
  }

  async onModuleDestroy() {
    try {
      console.log('Closing connections...');
      
      // Cerrar Prisma
      await this.$disconnect();
      console.log('Prisma disconnected');
      
      // Cerrar pool nativo
      if (this.nativePool) {
        await this.nativePool.close();
        console.log('Native connection pool closed');
      }
      
    } catch (error) {
      console.error('Error closing connections:', error);
      throw error;
    }
  }

  // Método para ejecutar queries nativas si es necesario
  async executeNativeQuery(query: string): Promise<any> {
    if (!this.nativePool) {
      throw new Error('Native connection not available');
    }
    
    const request = this.nativePool.request();
    return await request.query(query);
  }
} 