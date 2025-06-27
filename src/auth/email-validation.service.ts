import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailValidationService {
  constructor(private readonly httpService: HttpService) {}

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