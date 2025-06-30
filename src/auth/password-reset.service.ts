import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async requestPasswordReset(email: string, frontendUrl: string): Promise<{ success: boolean; message: string }> {
    // Verificar que el usuario existe
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.is_active) {
      throw new BadRequestException('Usuario desactivado');
    }

    // Invalidar tokens anteriores del usuario
    await this.prisma.password_reset_token.updateMany({
      where: {
        id_usuario: user.id_usuario,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generar nuevo token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora

    // Guardar token en base de datos
    await this.prisma.password_reset_token.create({
      data: {
        id_usuario: user.id_usuario,
        token: resetToken,
        expires_at: expiresAt,
      },
    });

    // Enviar email usando Azure Logic App
    try {
      const logicAppUrl = process.env.LOGIC_APP_PASSWORD_RESET_URL;
      
      if (!logicAppUrl) {
        console.warn('LOGIC_APP_PASSWORD_RESET_URL not configured');
        throw new Error('Email service not configured');
      }

      await firstValueFrom(
        this.httpService.post(logicAppUrl, {
          email: user.email,
          full_name: user.full_name,
          reset_token: resetToken,
          frontend_url: frontendUrl,
        })
      );

      return {
        success: true,
        message: 'Se ha enviado un email con las instrucciones para restablecer tu contraseña',
      };
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw new BadRequestException('Error al enviar el email de recuperación');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // Buscar token válido
    const resetToken = await this.prisma.password_reset_token.findUnique({
      where: { token },
      include: { usuario: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido');
    }

    if (resetToken.used) {
      throw new BadRequestException('Token ya utilizado');
    }

    if (new Date() > resetToken.expires_at) {
      throw new BadRequestException('Token expirado');
    }

    if (!resetToken.usuario.is_active) {
      throw new BadRequestException('Usuario desactivado');
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña y marcar token como usado
    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id_usuario: resetToken.id_usuario },
        data: {
          password_hash: hashedPassword,
          updated_at: new Date(),
        },
      }),
      this.prisma.password_reset_token.update({
        where: { id_token: resetToken.id_token },
        data: { used: true },
      }),
    ]);

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }

  async validateResetToken(token: string): Promise<{ valid: boolean; message?: string }> {
    const resetToken = await this.prisma.password_reset_token.findUnique({
      where: { token },
      include: { usuario: true },
    });

    if (!resetToken) {
      return { valid: false, message: 'Token inválido' };
    }

    if (resetToken.used) {
      return { valid: false, message: 'Token ya utilizado' };
    }

    if (new Date() > resetToken.expires_at) {
      return { valid: false, message: 'Token expirado' };
    }

    if (!resetToken.usuario.is_active) {
      return { valid: false, message: 'Usuario desactivado' };
    }

    return { valid: true };
  }
} 