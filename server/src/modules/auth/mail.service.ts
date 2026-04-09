import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      connectionTimeout: 5000,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });
  }

  async enviarContrasenaTemp(email: string, nombre: string, contrasenaTemp: string): Promise<void> {
    const from = `Energía PD <${process.env.MAIL_USER}>`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1d4ed8, #1e40af); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Energía PD</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0 0;">Sistema de Recursos Humanos</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Hola, ${nombre}</h2>
          <p style="color: #475569; line-height: 1.6;">
            Recibimos una solicitud para recuperar tu contraseña. A continuación te proporcionamos una <strong>contraseña temporal</strong>:
          </p>
          <div style="background: #1d4ed8; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="color: #bfdbfe; margin: 0 0 8px 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Tu contraseña temporal</p>
            <p style="color: white; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 4px; font-family: monospace;">${contrasenaTemp}</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Al iniciar sesión con esta contraseña, el sistema te pedirá que la cambies de inmediato.
          </p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
            <p style="color: #92400e; margin: 0; font-size: 13px;">
              ⚠️ Si no solicitaste este cambio, contacta a RRHH de inmediato.
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Contraseña temporal - Energía PD',
        html,
      });
      this.logger.log(`Email de contraseña temporal enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${email}: ${error.message}`);
      throw new Error('No se pudo enviar el correo. Contacta a RRHH.');
    }
  }
}
