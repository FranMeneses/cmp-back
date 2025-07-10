import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

/**
 * Servicio para gestionar el reseteo de contraseñas mediante tokens seguros.
 * 
 * @description Maneja todo el flujo de reseteo de contraseña:
 * - Generación de tokens criptográficamente seguros
 * - Envío de emails de reseteo via Azure Logic Apps
 * - Validación de tokens con verificación de expiración
 * - Actualización segura de contraseñas con hash bcrypt
 * - Invalidación automática de tokens anteriores
 * 
 * @class PasswordResetService
 * @injectable
 * 
 * @since 1.0.0
 */
@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  /**
   * Solicita el reseteo de contraseña para un usuario mediante email.
   * 
   * @description Realiza el proceso completo de solicitud de reseteo:
   * 1. Verifica que el usuario exista y esté activo
   * 2. Invalida todos los tokens anteriores del usuario
   * 3. Genera un nuevo token seguro con expiración de 1 hora
   * 4. Envía email con instrucciones via Azure Logic App
   * 
   * @param {string} email - Email del usuario que solicita el reseteo
   * @param {string} frontendUrl - URL base del frontend para construir el enlace de reseteo
   * 
   * @returns {Promise<{success: boolean, message: string}>} Confirmación del envío del email
   * 
   * @throws {NotFoundException} Cuando el usuario no existe en la base de datos
   * @throws {BadRequestException} Cuando el usuario está desactivado
   * @throws {BadRequestException} Si hay error en el servicio de envío de email
   * 
   * @since 1.0.0
   */
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

  /**
   * Cambia la contraseña de un usuario usando un token de reseteo válido.
   * 
   * @description Proceso completo de cambio de contraseña:
   * 1. Busca y valida el token de reseteo
   * 2. Verifica que no haya expirado ni sido usado
   * 3. Confirma que el usuario esté activo
   * 4. Genera hash seguro de la nueva contraseña (bcrypt, 12 rounds)
   * 5. Actualiza la contraseña y marca el token como usado en una transacción
   * 
   * @param {string} token - Token de reseteo recibido por email
   * @param {string} newPassword - Nueva contraseña en texto plano
   * 
   * @returns {Promise<{success: boolean, message: string}>} Confirmación del cambio exitoso
   * 
   * @throws {BadRequestException} Cuando el token es inválido
   * @throws {BadRequestException} Cuando el token ya fue utilizado
   * @throws {BadRequestException} Cuando el token ha expirado
   * @throws {BadRequestException} Cuando el usuario está desactivado
   * 
   * @since 1.0.0
   */
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

  /**
   * Valida si un token de reseteo de contraseña es válido y utilizable.
   * 
   * @description Realiza todas las validaciones necesarias:
   * - Verifica que el token exista en la base de datos
   * - Confirma que no haya sido usado previamente
   * - Verifica que no haya expirado (1 hora de validez)
   * - Confirma que el usuario asociado esté activo
   * 
   * @param {string} token - Token de reseteo a validar
   * 
   * @returns {Promise<{valid: boolean, message?: string}>} Estado de validez con mensaje explicativo
   * 
   * @since 1.0.0
   */
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