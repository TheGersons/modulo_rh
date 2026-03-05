import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import {
  CrearRevisorAsignadoDto,
  ActualizarRevisorAsignadoDto,
} from './dto/crear-revisor.dto';

@Injectable()
export class RevisoresAsignadosService {
  constructor(private prisma: PrismaService) {}

  // ─── Listar todos ────────────────────────────────────────────
  async getAll() {
    return this.prisma.revisorAsignado.findMany({
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            role: true,
            area: { select: { id: true, nombre: true } },
            puesto: { select: { id: true, nombre: true } },
          },
        },
        revisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            role: true,
            area: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Buscar revisor de un empleado ───────────────────────────
  async getRevisorDeEmpleado(empleadoId: string): Promise<string | null> {
    const asignacion = await this.prisma.revisorAsignado.findFirst({
      where: { empleadoId, activo: true },
      select: { revisorId: true },
    });
    return asignacion?.revisorId ?? null;
  }

  // ─── ¿Este userId puede revisar evidencias de empleadoId? ────
  async puedeRevisar(
    revisadorId: string,
    empleadoId: string,
  ): Promise<boolean> {
    const revisorAsignado = await this.getRevisorDeEmpleado(empleadoId);
    if (revisorAsignado) {
      return revisorAsignado === revisadorId;
    }
    // Flujo normal: jefe del área del empleado
    const empleado = await this.prisma.user.findUnique({
      where: { id: empleadoId },
      include: { area: { select: { jefeId: true } } },
    });
    return empleado?.area?.jefeId === revisadorId;
  }

  // ─── Crear asignación ────────────────────────────────────────
  async crear(dto: CrearRevisorAsignadoDto) {
    if (dto.empleadoId === dto.revisorId) {
      throw new BadRequestException(
        'Un empleado no puede ser su propio revisor',
      );
    }

    // Verificar que ambos usuarios existen
    const [empleado, revisor] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.empleadoId } }),
      this.prisma.user.findUnique({ where: { id: dto.revisorId } }),
    ]);
    if (!empleado) throw new NotFoundException('Empleado no encontrado');
    if (!revisor) throw new NotFoundException('Revisor no encontrado');

    // Verificar que no existe ya una asignación activa
    const existente = await this.prisma.revisorAsignado.findFirst({
      where: { empleadoId: dto.empleadoId, activo: true },
    });
    if (existente) {
      throw new ConflictException(
        'Este empleado ya tiene un revisor asignado. Desactívalo primero o edítalo.',
      );
    }

    return this.prisma.revisorAsignado.create({
      data: {
        empleadoId: dto.empleadoId,
        revisorId: dto.revisorId,
        motivo: dto.motivo,
        activo: true,
      },
      include: {
        empleado: { select: { id: true, nombre: true, apellido: true } },
        revisor: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  // ─── Actualizar (cambiar revisor, motivo, o desactivar) ──────
  async actualizar(id: string, dto: ActualizarRevisorAsignadoDto) {
    const asignacion = await this.prisma.revisorAsignado.findUnique({
      where: { id },
    });
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');

    if (dto.revisorId) {
      const revisor = await this.prisma.user.findUnique({
        where: { id: dto.revisorId },
      });
      if (!revisor) throw new NotFoundException('Revisor no encontrado');
      if (dto.revisorId === asignacion.empleadoId) {
        throw new BadRequestException(
          'Un empleado no puede ser su propio revisor',
        );
      }
    }

    return this.prisma.revisorAsignado.update({
      where: { id },
      data: {
        ...(dto.revisorId !== undefined && { revisorId: dto.revisorId }),
        ...(dto.motivo !== undefined && { motivo: dto.motivo }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
      },
      include: {
        empleado: { select: { id: true, nombre: true, apellido: true } },
        revisor: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  // ─── Eliminar ────────────────────────────────────────────────
  async eliminar(id: string) {
    const asignacion = await this.prisma.revisorAsignado.findUnique({
      where: { id },
    });
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');
    await this.prisma.revisorAsignado.delete({ where: { id } });
    return { message: 'Asignación eliminada' };
  }

  // ─── Listar empleados disponibles (sin revisor asignado activo) ──
  async getEmpleadosSinRevisor() {
    const conRevisor = await this.prisma.revisorAsignado.findMany({
      where: { activo: true },
      select: { empleadoId: true },
    });
    const idsConRevisor = conRevisor.map((r) => r.empleadoId);

    return this.prisma.user.findMany({
      where: {
        activo: true,
        id: { notIn: idsConRevisor },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true,
        area: { select: { id: true, nombre: true } },
        puesto: { select: { nombre: true } },
      },
      orderBy: [{ nombre: 'asc' }],
    });
  }

  // ─── Listar todos los usuarios como posibles revisores ───────
  async getPosiblesRevisores() {
    return this.prisma.user.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true,
        area: { select: { nombre: true } },
      },
      orderBy: [{ nombre: 'asc' }],
    });
  }
}
