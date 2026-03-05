import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';
import { AlertasService } from '../alertas/alertas.service';

@Injectable()
export class AuthCron {
  private readonly logger = new Logger(AuthCron.name);

  constructor(
    private authService: AuthService,
    private alertasService: AlertasService,
  ) {}

  // Limpiar sesiones expiradas — cada hora
  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    await this.authService.cleanExpiredSessions();
  }

  // Generar alertas automáticas — cada 5 minutos
  @Cron('*/5 * * * *')
  async handleAlertas() {
    try {
      const resultado = await this.alertasService.generarAlertasAutomaticas();
      if (resultado.alertasGeneradas > 0) {
        this.logger.log(
          `🔔 ${resultado.alertasGeneradas} alertas nuevas generadas`,
        );
      }
    } catch (error) {
      this.logger.error('Error en cron de alertas:', error.message);
    }
  }
}
