import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as sql from 'mssql';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private nativePool: sql.ConnectionPool | null = null;
  private prismaClient: PrismaClient | null = null;
  private connectionString: string = '';

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
      
      // Paso 3: Convertir este servicio en PrismaClient
      this.copyPrismaMethodsToService();
      console.log('Service converted to PrismaClient proxy');
      
    } catch (error) {
      console.error('Error in hybrid connection setup:', error);
      
      // Fallback: intentar conexión tradicional con Prisma
      console.log('Attempting fallback connection...');
      try {
        await this.createFallbackConnection();
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
    // Construir URL para Prisma que use Managed Identity
    this.connectionString = `sqlserver://servercmp.database.windows.net:1433;database=basedatoscmp;authentication=ActiveDirectoryMsi;encrypt=true;trustServerCertificate=false`;
    
    console.log('Connecting Prisma with Managed Identity URL...');
    
    // Crear cliente Prisma con la configuración correcta
    this.prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: this.connectionString,
        },
      },
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });

    await this.prismaClient.$connect();
    console.log('Prisma successfully connected with Managed Identity');
  }

  private async createFallbackConnection(): Promise<void> {
    console.log('Creating fallback Prisma connection...');
    this.prismaClient = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
    
    await this.prismaClient.$connect();
    this.copyPrismaMethodsToService();
  }

  private copyPrismaMethodsToService(): void {
    if (!this.prismaClient) return;

    // Copiar todos los métodos de Prisma al servicio
    const prismaPrototype = Object.getPrototypeOf(this.prismaClient);
    const propertyNames = Object.getOwnPropertyNames(prismaPrototype);
    
    for (const propertyName of propertyNames) {
      if (propertyName !== 'constructor') {
        (this as any)[propertyName] = (this.prismaClient as any)[propertyName].bind(this.prismaClient);
      }
    }

    // Copiar las propiedades del modelo (beneficiario, tarea, etc.)
    Object.keys(this.prismaClient).forEach(key => {
      (this as any)[key] = (this.prismaClient as any)[key];
    });

    // Métodos críticos
    (this as any).$connect = this.prismaClient.$connect.bind(this.prismaClient);
    (this as any).$disconnect = this.prismaClient.$disconnect.bind(this.prismaClient);
    (this as any).$transaction = this.prismaClient.$transaction.bind(this.prismaClient);
  }

  async onModuleDestroy() {
    try {
      console.log('Closing connections...');
      
      // Cerrar Prisma
      if (this.prismaClient) {
        await this.prismaClient.$disconnect();
        console.log('Prisma disconnected');
      }
      
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