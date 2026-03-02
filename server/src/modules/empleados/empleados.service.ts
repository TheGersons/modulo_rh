import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREAR EMPLEADO
  // ============================================
  async create(createEmpleadoDto: CreateEmpleadoDto) {
    // Validar que el email no exista
    const existeEmail = await this.prisma.user.findUnique({
      where: { email: createEmpleadoDto.email },
    });

    if (existeEmail) {
      throw new ConflictException(
        `Ya existe un empleado con el email "${createEmpleadoDto.email}"`,
      );
    }

    // Validar que el DNI no exista (si se proporciona)
    if (createEmpleadoDto.dni) {
      const existeDni = await this.prisma.user.findUnique({
        where: { dni: createEmpleadoDto.dni },
      });

      if (existeDni) {
        throw new ConflictException(
          `Ya existe un empleado con el DNI "${createEmpleadoDto.dni}"`,
        );
      }
    }

    // Validar que el área exista (si se proporciona)
    if (createEmpleadoDto.areaId) {
      const area = await this.prisma.area.findUnique({
        where: { id: createEmpleadoDto.areaId },
      });

      if (!area) {
        throw new NotFoundException(
          `No se encontró el área con ID ${createEmpleadoDto.areaId}`,
        );
      }
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(createEmpleadoDto.password, 10);

    // Crear empleado
    const empleado = await this.prisma.user.create({
      data: {
        dni: createEmpleadoDto.dni,
        email: createEmpleadoDto.email,
        nombre: createEmpleadoDto.nombre,
        apellido: createEmpleadoDto.apellido,
        password: hashedPassword,
        role: createEmpleadoDto.role,
        areaId: createEmpleadoDto.areaId,
        puestoId: createEmpleadoDto.puestoId,
        activo: createEmpleadoDto.activo ?? true,
      },
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
        puesto: {
          select: { id: true, nombre: true },
        },
      },
    });


    // No retornar el password
    const { password, ...empleadoSinPassword } = empleado;
    return empleadoSinPassword;
  }

  // ============================================
  // LISTAR TODOS LOS EMPLEADOS
  // ============================================
  async findAll(filters?: {
    areaId?: string;
    role?: string;
    activo?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.areaId) {
      where.areaId = filters.areaId;
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters?.search) {
      where.OR = [
        { dni: { contains: filters.search } },
        { nombre: { contains: filters.search } },
        { apellido: { contains: filters.search } },
        { email: { contains: filters.search } },
        // puesto es relación, se busca por nombre del puesto
        { puesto: { nombre: { contains: filters.search } } },
      ];
    }

    const empleados = await this.prisma.user.findMany({
      where,
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            evaluacionesRecibidas: true,
            evaluacionesCreadas: true,
          },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    // No retornar passwords
    return empleados.map(({ password, ...empleado }) => empleado);
  }

  // ============================================
  // OBTENER UN EMPLEADO POR ID
  // ============================================
  async findOne(id: string) {
    const empleado = await this.prisma.user.findUnique({
      where: { id },
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
            jefe: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        _count: {
          select: {
            evaluacionesRecibidas: true,
            evaluacionesCreadas: true,
          },
        },
      },
    });

    if (!empleado) {
      throw new NotFoundException(`No se encontró el empleado con ID ${id}`);
    }

    // No retornar password
    const { password, ...empleadoSinPassword } = empleado;
    return empleadoSinPassword;
  }

  // ============================================
  // OBTENER EMPLEADOS POR ÁREA
  // ============================================
  async findByArea(areaId: string) {
    const area = await this.prisma.area.findUnique({
      where: { id: areaId },
    });

    if (!area) {
      throw new NotFoundException(`No se encontró el área con ID ${areaId}`);
    }

    const empleados = await this.prisma.user.findMany({
      where: { areaId, activo: true },
      include: {
        _count: {
          select: {
            evaluacionesRecibidas: true,
          },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    return empleados.map(({ password, ...empleado }) => empleado);
  }

  // ============================================
  // BÚSQUEDA DE EMPLEADOS
  // ============================================
  async search(query: string) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException(
        'El término de búsqueda no puede estar vacío',
      );
    }

    const empleados = await this.prisma.user.findMany({
      where: {
        OR: [
          { dni: { contains: query } },
          { nombre: { contains: query } },
          { apellido: { contains: query } },
          { email: { contains: query } },
          { puesto: { nombre: { contains: query } } },
        ],
        activo: true,
      },
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      take: 20,
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    return empleados.map(({ password, ...empleado }) => empleado);
  }

  // ============================================
  // ACTUALIZAR EMPLEADO
  // ============================================
  async update(id: string, updateEmpleadoDto: UpdateEmpleadoDto) {
    // Verificar que el empleado existe
    const empleadoExistente = await this.findOne(id);

    // Si se actualiza el email, validar que no exista otro con ese email
    if (
      updateEmpleadoDto.email &&
      updateEmpleadoDto.email !== empleadoExistente.email
    ) {
      const existeEmail = await this.prisma.user.findUnique({
        where: { email: updateEmpleadoDto.email },
      });

      if (existeEmail) {
        throw new ConflictException(
          `Ya existe un empleado con el email "${updateEmpleadoDto.email}"`,
        );
      }
    }

    // Si se actualiza el DNI, validar que no exista otro con ese DNI
    if (
      updateEmpleadoDto.dni &&
      updateEmpleadoDto.dni !== empleadoExistente.dni
    ) {
      const existeDni = await this.prisma.user.findUnique({
        where: { dni: updateEmpleadoDto.dni },
      });

      if (existeDni) {
        throw new ConflictException(
          `Ya existe un empleado con el DNI "${updateEmpleadoDto.dni}"`,
        );
      }
    }

    // Si se actualiza el área, validar que exista
    if (
      updateEmpleadoDto.areaId &&
      updateEmpleadoDto.areaId !== empleadoExistente.areaId
    ) {
      const area = await this.prisma.area.findUnique({
        where: { id: updateEmpleadoDto.areaId },
      });

      if (!area) {
        throw new NotFoundException(
          `No se encontró el área con ID ${updateEmpleadoDto.areaId}`,
        );
      }
    }

    // Si se actualiza la contraseña, encriptarla
    let dataToUpdate: any = { ...updateEmpleadoDto };
    if (updateEmpleadoDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateEmpleadoDto.password, 10);
    }

    const empleado = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    const { password, ...empleadoSinPassword } = empleado;
    return empleadoSinPassword;
  }

  // ============================================
  // ELIMINAR EMPLEADO (SOFT DELETE)
  // ============================================
  async remove(id: string) {
    // Verificar que el empleado existe
    await this.findOne(id);

    // Verificar si es jefe de algún área
    const esJefe = await this.prisma.area.findFirst({
      where: { jefeId: id },
    });

    if (esJefe) {
      throw new BadRequestException(
        `No se puede eliminar porque es jefe del área "${esJefe.nombre}". Asigne otro jefe primero.`,
      );
    }

    // Soft delete: desactivar en lugar de eliminar
    await this.prisma.user.update({
      where: { id },
      data: { activo: false },
    });

    return { message: 'Empleado desactivado exitosamente' };
  }

  // ============================================
  // ACTIVAR/DESACTIVAR EMPLEADO
  // ============================================
  async toggleActivo(id: string) {
    const empleado = await this.findOne(id);

    const empleadoActualizado = await this.prisma.user.update({
      where: { id },
      data: { activo: !empleado.activo },
    });

    const { password, ...empleadoSinPassword } = empleadoActualizado;

    return {
      message: `Empleado ${empleadoActualizado.activo ? 'activado' : 'desactivado'} exitosamente`,
      empleado: empleadoSinPassword,
    };
  }

  // ============================================
  // OBTENER EVALUACIONES DE UN EMPLEADO
  // ============================================
  async getEvaluaciones(id: string) {
    await this.findOne(id);

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: { empleadoId: id },
      include: {
        evaluador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puesto: {
              select: { nombre: true },
            },
          },
        },
        detalles: {
          include: {
            kpi: {
              select: {
                id: true,
                key: true,
                indicador: true,
                meta: true,
                unidad: true,
              },
            },
          },
        },
      },
      orderBy: [{ anio: 'desc' }, { periodo: 'desc' }],
    });

    return evaluaciones;
  }

  // ============================================
  // OBTENER ESTADÍSTICAS DE UN EMPLEADO
  // ============================================
  async getEstadisticas(id: string) {
    const empleado = await this.findOne(id);

    // Obtener todas las evaluaciones
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: { empleadoId: id },
      include: {
        detalles: true,
      },
    });

    if (evaluaciones.length === 0) {
      return {
        empleado: {
          id: empleado.id,
          nombre: `${empleado.nombre} ${empleado.apellido}`,
          puesto: (empleado as any).puesto?.nombre || 'Sin asignar',
          area: empleado.area?.nombre,
        },
        estadisticas: {
          totalEvaluaciones: 0,
          promedioGeneral: 0,
          evaluacionesValidadas: 0,
          evaluacionesPendientes: 0,
          kpisRojos: 0,
          kpisVerdes: 0,
        },
      };
    }

    // Calcular estadísticas
    const totalEvaluaciones = evaluaciones.length;
    const evaluacionesValidadas = evaluaciones.filter(
      (e) => e.status === 'validada',
    ).length;
    const evaluacionesPendientes = evaluaciones.filter(
      (e) => e.status === 'enviada',
    ).length;

    const evaluacionesCompletadas = evaluaciones.filter(
      (e) => e.status === 'enviada' || e.status === 'validada',
    );

    let promedioGeneral = 0;
    if (evaluacionesCompletadas.length > 0) {
      const suma = evaluacionesCompletadas.reduce(
        (acc, e) => acc + (e.promedioGeneral || 0),
        0,
      );
      promedioGeneral = suma / evaluacionesCompletadas.length;
    }

    // Contar KPIs rojos y verdes
    let kpisRojos = 0;
    let kpisVerdes = 0;
    evaluaciones.forEach((evaluacion) => {
      kpisRojos += evaluacion.detalles.filter(
        (d) => d.estado === 'rojo',
      ).length;
      kpisVerdes += evaluacion.detalles.filter(
        (d) => d.estado === 'verde',
      ).length;
    });

    return {
      empleado: {
        id: empleado.id,
        nombre: `${empleado.nombre} ${empleado.apellido}`,
        puesto: (empleado as any).puesto?.nombre || 'Sin asignar',
        area: empleado.area?.nombre,
      },
      estadisticas: {
        totalEvaluaciones,
        promedioGeneral: Math.round(promedioGeneral * 100) / 100,
        evaluacionesValidadas,
        evaluacionesPendientes,
        kpisRojos,
        kpisVerdes,
      },
      ultimasEvaluaciones: evaluaciones.slice(0, 5).map((e) => ({
        periodo: e.periodo,
        anio: e.anio,
        promedio: e.promedioGeneral,
        status: e.status,
      })),
    };
  }

  // ============================================
  // OBTENER ESTADÍSTICAS GLOBALES
  // ============================================
  async getEstadisticasGlobales() {
    const total = await this.prisma.user.count();
    const activos = await this.prisma.user.count({ where: { activo: true } });
    const inactivos = total - activos;

    const porRol = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: { activo: true },
    });

    const porArea = await this.prisma.user.groupBy({
      by: ['areaId'],
      _count: true,
      where: { activo: true, areaId: { not: null } },
    });

    // Obtener nombres de áreas
    const areasConNombres = await Promise.all(
      porArea.map(async (item) => {
        const area = await this.prisma.area.findUnique({
          where: { id: item.areaId! },
          select: { nombre: true },
        });
        return {
          area: area?.nombre || 'Sin área',
          cantidad: item._count,
        };
      }),
    );

    return {
      totales: {
        total,
        activos,
        inactivos,
      },
      porRol: porRol.map((r) => ({
        role: r.role,
        cantidad: r._count,
      })),
      porArea: areasConNombres,
    };
  }

  // En tu empleados.service.ts
  async createBulk(createEmpleadoDtos: CreateEmpleadoDto[]) {
    const results = {
      success: 0,
      errors: [] as any[],
    };

    for (const dto of createEmpleadoDtos) {
      try {
        // Reutiliza tu lógica de creación existente si es posible
        // para que valide duplicados de DNI/Email y hashee el password
        await this.create(dto);
        results.success++;
      } catch (error) {
        results.errors.push({
          email: dto.email,
          error: error.message,
        });
      }
    }

    return results;
  }
}
