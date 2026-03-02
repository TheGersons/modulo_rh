import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class AuthCron {
  constructor(private authService: AuthService) {}

  // Ejecutar cada hora
  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    await this.authService.cleanExpiredSessions();
  }
}
