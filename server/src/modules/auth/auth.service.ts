import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    // Por ahora, solo validación básica mockeada
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
      };
    }

    // TODO: Implementar validación real de password con bcrypt
    if (user.password !== password) {
      return {
        success: false,
        message: 'Contraseña incorrecta',
      };
    }

    return {
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
        areaId: user.areaId
      },
    };
  }
}