import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
    const nodeEnv = process.env.NODE_ENV;
    
    this.logger.log(`Initializing Prisma connection in ${nodeEnv} mode...`);
    
    try {
      this.prismaClient = new PrismaClient();
      await this.prismaClient.$connect();
      this.isConnected = true;
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error.message);
      throw error;
    }
  }



  async onModuleDestroy() {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
} 