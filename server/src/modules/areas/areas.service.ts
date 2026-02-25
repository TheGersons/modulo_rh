import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREAR ÁREA
  // ============================================
  async create(createAreaDto: CreateAreaDto) {
    // Validar que el nombre no exista
    const existeNombre = await this.prisma.area.findUnique({
      where: { nombre: createAreaDto.nombre },
    });

    if (existeNombre) {
      throw new ConflictException(
        `Ya existe un área con el nombre "${createAreaDto.nombre}"`,
      );
    }

    // Validar que el jefe exista
    const jefe = await this.prisma.user.findUnique({
      where: { id: createAreaDto.jefeId },
    });

    if (!jefe) {
      throw new NotFoundException(
        `No se encontró el jefe con ID ${createAreaDto.jefeId}`,
      );
    }

    // Validar que el jefe no esté asignado a otra área
    const jefeYaAsignado = await this.prisma.area.findFirst({
      where: { jefeId: createAreaDto.jefeId },
    });

    if (jefeYaAsignado) {
      throw new ConflictException(
        `El jefe ya está asignado al área "${jefeYaAsignado.nombre}."`,
      );
    }

    // Crear área
    const area = await this.prisma.area.create({
      data: {
        nombre: createAreaDto.nombre,
        descripcion: createAreaDto.descripcion,
        jefeId: createAreaDto.jefeId,
        activa: createAreaDto.activa ?? true,
        promedioGlobal: 0,
        totalKpis: 0,
        kpisRojos: 0,
        porcentajeRojos: 0,
        nivelRiesgo: 'BAJO',
        ranking: 0,
      },
      include: {
        jefe: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            puesto: true,
          },
        },
      },
    });

    // Actualizar el areaId del jefe
    await this.prisma.user.update({
      where: { id: createAreaDto.jefeId },
      data: { areaId: area.id },
    });

    return area;
  }

  // ============================================
  // LISTAR TODAS LAS ÁREAS
  // ============================================
  async findAll() {
    const areas = await this.prisma.area.findMany({
      include: {
        jefe: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            puesto: true,
          },
        },
        _count: {
          select: {
            empleados: true,
            kpis: true,
          },
        },
      },
      orderBy: {
        ranking: 'asc',
      },
    });

    return areas;
  }

  // ============================================
  // OBTENER UN ÁREA POR ID
  // ============================================
  async findOne(id: string) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: {
        jefe: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            puesto: true,
          },
        },
        _count: {
          select: {
            empleados: true,
            kpis: true,
            alertas: true,
          },
        },
      },
    });

    if (!area) {
      throw new NotFoundException(`No se encontró el área con ID ${id}`);
    }

    return area;
  }

  // ============================================
  // ACTUALIZAR ÁREA
  // ============================================
  async update(id: string, updateAreaDto: UpdateAreaDto) {
    // Verificar que el área existe
    const areaExistente = await this.findOne(id);

    // Si se actualiza el nombre, validar que no exista otro con ese nombre
    if (updateAreaDto.nombre && updateAreaDto.nombre !== areaExistente.nombre) {
      const existeNombre = await this.prisma.area.findUnique({
        where: { nombre: updateAreaDto.nombre },
      });

      if (existeNombre) {
        throw new ConflictException(
          `Ya existe un área con el nombre "${updateAreaDto.nombre}"`,
        );
      }
    }

    // Si se actualiza el jefe, validar
    if (updateAreaDto.jefeId && updateAreaDto.jefeId !== areaExistente.jefeId) {
      const jefe = await this.prisma.user.findUnique({
        where: { id: updateAreaDto.jefeId },
      });

      if (!jefe) {
        throw new NotFoundException(
          `No se encontró el jefe con ID ${updateAreaDto.jefeId}`,
        );
      }

      const jefeYaAsignado = await this.prisma.area.findFirst({
        where: { jefeId: updateAreaDto.jefeId },
      });

      if (jefeYaAsignado && jefeYaAsignado.id !== id) {
        throw new ConflictException(
          `El jefe ya está asignado al área "${jefeYaAsignado.nombre}"`,
        );
      }

      // Actualizar areaId del nuevo jefe
      await this.prisma.user.update({
        where: { id: updateAreaDto.jefeId },
        data: { areaId: id },
      });

      // Limpiar areaId del jefe anterior
      if (areaExistente.jefeId) {
        await this.prisma.user.update({
          where: { id: areaExistente.jefeId },
          data: { areaId: null },
        });
      }
    }

    const area = await this.prisma.area.update({
      where: { id },
      data: updateAreaDto,
      include: {
        jefe: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            puesto: true,
          },
        },
      },
    });

    return area;
  }

  // ============================================
  // ELIMINAR ÁREA
  // ============================================
  async remove(id: string) {
    // Verificar que el área existe
    await this.findOne(id);

    // Verificar que no tenga empleados asignados
    const empleados = await this.prisma.user.count({
      where: { areaId: id },
    });

    if (empleados > 0) {
      throw new BadRequestException(
        `No se puede eliminar el área porque tiene ${empleados} empleado(s) asignado(s)`,
      );
    }

    // Verificar que no tenga KPIs asignados
    const kpis = await this.prisma.kPI.count({
      where: { areaId: id },
    });

    if (kpis > 0) {
      throw new BadRequestException(
        `No se puede eliminar el área porque tiene ${kpis} KPI(s) asignado(s)`,
      );
    }

    await this.prisma.area.delete({
      where: { id },
    });

    return { message: 'Área eliminada exitosamente' };
  }

  // ============================================
  // OBTENER EMPLEADOS DE UN ÁREA
  // ============================================
  async getEmpleados(id: string) {
    await this.findOne(id);

    const empleados = await this.prisma.user.findMany({
      where: { areaId: id },
      select: {
        id: true,
        dni: true,
        nombre: true,
        apellido: true,
        email: true,
        puesto: true,
        role: true,
        activo: true,
      },
    });

    return empleados;
  }

  // ============================================
  // OBTENER KPIs DE UN ÁREA
  // ============================================
  async getKpis(id: string) {
    await this.findOne(id);

    const kpis = await this.prisma.kPI.findMany({
      where: { areaId: id, activo: true },
      orderBy: { orden: 'asc' },
    });

    return kpis;
  }

  // ============================================
  // OBTENER ESTADÍSTICAS DE UN ÁREA
  // ============================================
  async getEstadisticas(id: string) {
    const area = await this.findOne(id);

    // Obtener empleados
    const empleados = await this.prisma.user.count({
      where: { areaId: id, activo: true },
    });

    // Obtener KPIs
    const totalKpis = await this.prisma.kPI.count({
      where: { areaId: id, activo: true },
    });

    // Obtener evaluaciones del periodo actual
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        empleado: { areaId: id },
        anio: new Date().getFullYear(),
      },
      include: {
        detalles: true,
      },
    });

    // Calcular estadísticas
    const totalEvaluaciones = evaluaciones.length;
    const evaluacionesCompletadas = evaluaciones.filter(
      (e) => e.status === 'enviada' || e.status === 'validada',
    ).length;
    const evaluacionesValidadas = evaluaciones.filter(
      (e) => e.status === 'validada',
    ).length;

    // Calcular promedio de evaluaciones
    let promedioEvaluaciones = 0;
    if (evaluacionesCompletadas > 0) {
      const suma = evaluaciones
        .filter((e) => e.status === 'enviada' || e.status === 'validada')
        .reduce((acc, e) => acc + (e.promedioGeneral || 0), 0);
      promedioEvaluaciones = suma / evaluacionesCompletadas;
    }

    // Contar KPIs rojos
    let kpisRojos = 0;
    evaluaciones.forEach((evaluacion) => {
      kpisRojos += evaluacion.detalles.filter(
        (d) => d.estado === 'rojo',
      ).length;
    });

    const porcentajeRojos =
      totalKpis > 0 ? (kpisRojos / (totalKpis * empleados)) * 100 : 0;

    return {
      area: {
        id: area.id,
        nombre: area.nombre,
        promedioGlobal: area.promedioGlobal,
        nivelRiesgo: area.nivelRiesgo,
        ranking: area.ranking,
      },
      recursos: {
        empleados,
        totalKpis,
        kpisRojos,
        porcentajeRojos: Math.round(porcentajeRojos * 100) / 100,
      },
      evaluaciones: {
        total: totalEvaluaciones,
        completadas: evaluacionesCompletadas,
        validadas: evaluacionesValidadas,
        pendientes: totalEvaluaciones - evaluacionesCompletadas,
        promedio: Math.round(promedioEvaluaciones * 100) / 100,
      },
    };
  }

  // ============================================
  // RECALCULAR MÉTRICAS DE UN ÁREA
  // ============================================
  async recalcularMetricas(id: string) {
    const area = await this.findOne(id);

    // Obtener todas las evaluaciones completadas del área
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        empleado: { areaId: id },
        status: { in: ['enviada', 'validada'] },
      },
      include: {
        detalles: true,
      },
    });

    if (evaluaciones.length === 0) {
      return await this.prisma.area.update({
        where: { id },
        data: {
          promedioGlobal: 0,
          totalKpis: 0,
          kpisRojos: 0,
          porcentajeRojos: 0,
          nivelRiesgo: 'BAJO',
        },
      });
    }

    // Calcular promedio global
    const sumaPromedios = evaluaciones.reduce(
      (acc, e) => acc + (e.promedioGeneral || 0),
      0,
    );
    const promedioGlobal = sumaPromedios / evaluaciones.length;

    // Contar KPIs totales y rojos
    let totalKpis = 0;
    let kpisRojos = 0;

    evaluaciones.forEach((evaluacion) => {
      totalKpis += evaluacion.detalles.length;
      kpisRojos += evaluacion.detalles.filter(
        (d) => d.estado === 'rojo',
      ).length;
    });

    const porcentajeRojos = totalKpis > 0 ? (kpisRojos / totalKpis) * 100 : 0;

    // Determinar nivel de riesgo
    let nivelRiesgo = 'BAJO';
    if (porcentajeRojos >= 30) {
      nivelRiesgo = 'ALTO';
    } else if (porcentajeRojos >= 15) {
      nivelRiesgo = 'MEDIO';
    }

    // Actualizar área
    const areaActualizada = await this.prisma.area.update({
      where: { id },
      data: {
        promedioGlobal: Math.round(promedioGlobal * 100) / 100,
        totalKpis,
        kpisRojos,
        porcentajeRojos: Math.round(porcentajeRojos * 100) / 100,
        nivelRiesgo,
      },
    });

    // Recalcular rankings de todas las áreas
    await this.recalcularRankings();

    return areaActualizada;
  }

  // ============================================
  // RECALCULAR RANKINGS DE TODAS LAS ÁREAS
  // ============================================
  async recalcularRankings() {
    const areas = await this.prisma.area.findMany({
      where: { activa: true },
      orderBy: { promedioGlobal: 'desc' },
    });

    // Asignar rankings
    for (let i = 0; i < areas.length; i++) {
      await this.prisma.area.update({
        where: { id: areas[i].id },
        data: { ranking: i + 1 },
      });
    }

    return { message: 'Rankings recalculados exitosamente' };
  }
}
