import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/common/database/prisma.service';
import { AlertasService } from '../alertas/alertas.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private alertasService: AlertasService,
  ) {}

  async login(
    email: string,
    password: string,
    deviceInfo?: { userAgent?: string; ipAddress?: string },
  ) {
    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        area: { select: { id: true, nombre: true } },
        puesto: { select: { id: true, nombre: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo. Contacta a RRHH.');
    }

    // Validar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Cerrar sesiones previas del mismo dispositivo
    await this.prisma.session.deleteMany({
      where: {
        userId: user.id,
        userAgent: deviceInfo?.userAgent,
      },
    });

    // Generar tokens
    const { accessToken, refreshToken, sessionId } = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    // Crear sesión en DB
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        accessToken,
        refreshToken,
        deviceInfo: this.generateDeviceFingerprint(deviceInfo),
        ipAddress: deviceInfo?.ipAddress,
        userAgent: deviceInfo?.userAgent,
        expiresAt,
      },
    });

    // Generar alertas automáticas al iniciar sesión (non-blocking)
    this.alertasService
      .generarAlertasAutomaticas()
      .catch((err) =>
        console.warn('Error al generar alertas en login:', err.message),
      );

    return {
      success: true,
      message: 'Login exitoso',
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
        apellido: user.apellido,
        areaId: user.areaId,
        area: user.area,
        puesto: user.puesto,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException(
        'Sesión expirada. Por favor, inicia sesión nuevamente.',
      );
    }

    const payload = {
      sub: session.userId,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    };

    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // ← NUEVO: rotar refresh token con nueva expiración de 1h desde ahora
    const newRefreshToken = this.jwtService.sign(
      { sub: session.userId, sessionId: session.id, type: 'refresh' },
      { expiresIn: '1h' },
    );

    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 1); // ← extender 1h desde ahora

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // ← rotar el refresh token
        lastActivity: new Date(),
        expiresAt: newExpiresAt, // ← extender expiración
      },
    });

    return {
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // ← devolver el nuevo refresh token
      expiresIn: 900,
    };
  }

  async logout(userId: string, token: string) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        OR: [{ accessToken: token }, { refreshToken: token }],
      },
    });

    return { success: true, message: 'Sesión cerrada exitosamente' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const sessionId = randomBytes(16).toString('hex');

    const payload = { sub: userId, email, role, sessionId };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: userId, sessionId, type: 'refresh' },
      { expiresIn: '1h' },
    );

    return { accessToken, refreshToken, sessionId };
  }

  private generateDeviceFingerprint(deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
  }): string {
    const parts: string[] = [];
    if (deviceInfo?.userAgent)
      parts.push(deviceInfo.userAgent.substring(0, 50));
    if (deviceInfo?.ipAddress) parts.push(deviceInfo.ipAddress);
    return parts.join('|') || 'unknown';
  }

  async cleanExpiredSessions() {
    const deleted = await this.prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    console.log(
      `🧹 Limpieza de sesiones: ${deleted.count} sesiones expiradas eliminadas`,
    );
    return deleted.count;
  }
}
