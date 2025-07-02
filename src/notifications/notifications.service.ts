import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationInput } from '../graphql/graphql.types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  // Cron job que se ejecuta todos los días a las 8:00 AM
  @Cron('0 8 * * *', {
    timeZone: 'America/Santiago',
  })
  async checkTasksExpiringSoon() {
    this.logger.log('Ejecutando verificación de tareas por vencer...');
    
    try {
      // Consulta SQL directa para obtener tareas que vencen en 5 días
      const tasksExpiring = await this.prisma.$queryRaw`
        SELECT 
          t.id_tarea, 
          t.nombre AS tarea_nombre, 
          t.id_valle, 
          v.valle_name,
          u.id_usuario, 
          u.full_name, 
          u.email, 
          r.nombre AS rol_nombre
        FROM tarea t
        JOIN valle v ON t.id_valle = v.id_valle
        JOIN usuario u ON (
          -- Encargado Cumplimiento (id_rol = 5) o Jefe Relacionamiento del valle correspondiente
          (u.id_rol = 5) OR
          (u.id_rol = 7 AND v.valle_name = 'Valle del Huasco') OR
          (u.id_rol = 8 AND v.valle_name = 'Valle de Copiapó') OR
          (u.id_rol = 6 AND v.valle_name = 'Valle del Elqui')
        )
        JOIN rol r ON u.id_rol = r.id_rol
        JOIN subtarea s ON s.id_tarea = t.id_tarea
        WHERE DATEDIFF(DAY, GETDATE(), s.fecha_termino) = 5
        AND s.id_estado != 4 -- No completadas
      `;

      // Crear notificaciones para cada usuario
      for (const task of tasksExpiring as any[]) {
        await this.createNotification({
          id_usuario: task.id_usuario,
          titulo: 'Tarea próxima a vencer',
          mensaje: `La tarea "${task.tarea_nombre}" del valle "${task.valle_name}" vence en 5 días.`,
          id_tarea: task.id_tarea,
        });
      }

      this.logger.log(`Notificaciones creadas para ${(tasksExpiring as any[]).length} usuarios`);
    } catch (error) {
      this.logger.error('Error al generar notificaciones:', error);
    }
  }

  // Cron job para verificar cumplimientos próximos a vencer
  @Cron('0 8 * * *', {
    timeZone: 'America/Santiago',
  })
  async checkComplianceExpiringSoon() {
    this.logger.log('Ejecutando verificación de cumplimientos por vencer...');
    
    try {
      // Consulta SQL para cumplimientos próximos a vencer
      const compliancesExpiring = await this.prisma.$queryRaw`
        SELECT 
          c.id_cumplimiento,
          t.id_tarea,
          t.nombre AS tarea_nombre,
          t.id_valle,
          v.valle_name,
          ce.estado AS cumplimiento_estado,
          ce.dias AS dias_limite,
          c.updated_at AS fecha_cambio_estado,
          u.id_usuario,
          u.full_name,
          u.email,
          rol.nombre AS rol_nombre,
          DATEDIFF(DAY, c.updated_at, GETDATE()) AS dias_transcurridos
        FROM cumplimiento c
        JOIN tarea t ON c.id_tarea = t.id_tarea
        JOIN valle v ON t.id_valle = v.id_valle
        JOIN cumplimiento_estado ce ON c.id_cump_est = ce.id_cumplimiento_estado
        JOIN usuario u ON (
          -- Encargado Cumplimiento (id_rol = 5) o Jefe Relacionamiento del valle correspondiente
          (u.id_rol = 5) OR
          (u.id_rol = 7 AND v.valle_name = 'Valle del Huasco') OR
          (u.id_rol = 8 AND v.valle_name = 'Valle de Copiapó') OR
          (u.id_rol = 6 AND v.valle_name = 'Valle del Elqui')
        )
        JOIN rol ON u.id_rol = rol.id_rol
        WHERE c.updated_at IS NOT NULL
        AND ce.dias > 0
        AND ce.estado != 'Completado'
        AND (
          -- Estados de 5 días: notificar a los 3 días transcurridos (2 días restantes)
          (ce.dias = 5 AND DATEDIFF(DAY, c.updated_at, GETDATE()) = 3) OR
          -- Estados de 15 días: notificar a los 10 días transcurridos (5 días restantes)
          (ce.dias = 15 AND DATEDIFF(DAY, c.updated_at, GETDATE()) = 10) OR
          -- Estados de 30 días: notificar a los 25 días transcurridos (5 días restantes)
          (ce.dias = 30 AND DATEDIFF(DAY, c.updated_at, GETDATE()) = 25)
        )
      `;

      // Crear notificaciones para cada usuario
      for (const compliance of compliancesExpiring as any[]) {
        const diasRestantes = compliance.dias_limite - compliance.dias_transcurridos;
        await this.createNotification({
          id_usuario: compliance.id_usuario,
          titulo: 'Cumplimiento próximo a vencer',
          mensaje: `El cumplimiento "${compliance.cumplimiento_estado}" de la tarea "${compliance.tarea_nombre}" (${compliance.valle_name}) vence en ${diasRestantes} días.`,
          id_tarea: compliance.id_tarea,
        });
      }

      this.logger.log(`Notificaciones de cumplimiento creadas para ${(compliancesExpiring as any[]).length} usuarios`);
    } catch (error) {
      this.logger.error('Error al generar notificaciones de cumplimiento:', error);
    }
  }

  // Cron job para limpiar notificaciones leídas hace más de 3 días
  @Cron('0 2 * * *', {
    timeZone: 'America/Santiago',
  })
  async cleanupReadNotifications() {
    this.logger.log('Limpiando notificaciones leídas hace más de 3 días...');
    
    try {
      const result = await this.prisma.$executeRaw`
        DELETE FROM notificacion 
        WHERE read_at IS NOT NULL 
        AND read_at < DATEADD(DAY, -3, GETDATE())
      `;
      
      this.logger.log(`${result} notificaciones antiguas eliminadas`);
    } catch (error) {
      this.logger.error('Error al limpiar notificaciones:', error);
    }
  }

  async createNotification(dto: CreateNotificationInput) {
    return this.prisma.notificacion.create({
      data: {
        id_usuario: dto.id_usuario,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        id_tarea: dto.id_tarea,
        leida: false,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.notificacion.findMany({
      where: { id_usuario: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notificacion.updateMany({
      where: {
        id_notificacion: notificationId,
        id_usuario: userId,
      },
      data: {
        leida: true,
        read_at: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notificacion.count({
      where: {
        id_usuario: userId,
        leida: false,
      },
    });
  }
} 