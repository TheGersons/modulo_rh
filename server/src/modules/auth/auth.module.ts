import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from 'src/common/database/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthCron } from './auth.cron';
import { AlertasModule } from '../alertas/alertas.module';
import { MailService } from './mail.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'tu-secreto-super-seguro-cambiar-en-produccion',
      signOptions: { expiresIn: '15m' },
    }),
    AlertasModule, // ← para inyectar AlertasService en AuthService y AuthCron
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, AuthCron, MailService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
