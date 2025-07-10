import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Servicio para validar direcciones de email usando servicios externos.
 * 
 * @description Utiliza Azure Logic Apps para validar que las direcciones de email
 * sean válidas y estén disponibles. Incluye manejo de errores con fallback
 * permisivo en caso de que el servicio externo no esté disponible.
 * 
 * @class EmailValidationService
 * @injectable
 * 
 * @since 1.0.0
 */
@Injectable()
export class EmailValidationService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Valida una dirección de email usando un servicio externo.
   * 
   * @description Envía el email a Azure Logic App para validación. Si el servicio
   * no está configurado o hay errores, retorna true por defecto (comportamiento permisivo).
   * Esto evita que problemas del servicio externo bloqueen el registro de usuarios.
   * 
   * @param {string} email - Dirección de email a validar
   * 
   * @returns {Promise<boolean>} true si el email es válido o si hay error en validación, false si es inválido
   * 
   * @since 1.0.0
   */
  async validateEmail(email: string): Promise<boolean> {
    try {
      const logicAppUrl = process.env.LOGIC_APP_EMAIL_VALIDATION_URL;
      
      if (!logicAppUrl) {
        console.warn('LOGIC_APP_EMAIL_VALIDATION_URL not configured, skipping validation');
        return true; // Por defecto permitir si no está configurado
      }

      const response = await firstValueFrom(
        this.httpService.post(logicAppUrl, {
          email: email
        })
      );

      // Retorna true si la validación es exitosa
      return response.data.valid === true;
    } catch (error) {
      // En caso de error en el servicio, por defecto permitir
      // Puedes cambiar esto según tus necesidades de negocio
      console.error('Email validation error:', error);
      return true; // O false si prefieres ser más restrictivo
    }
  }
} 