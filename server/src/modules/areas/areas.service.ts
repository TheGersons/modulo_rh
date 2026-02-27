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
    // Validar que el nombre no exista en el mismo nivel
    const existeNombre = await this.prisma.area.findFirst({
      where: {
        nombre: createAreaDto.nombre,
        areaPadreId: createAreaDto.areaPadreId || null,
      },
    });

    if (existeNombre) {
      throw new ConflictException(
        `Ya existe un área con el nombre "${createAreaDto.nombre}" en este nivel`,
      );
    }

    // Validar área padre si se especifica
    if (createAreaDto.areaPadreId) {
      const areaPadre = await this.prisma.area.findUnique({
        where: { id: createAreaDto.areaPadreId },
      });

      if (!areaPadre) {
        throw new NotFoundException(
          `No se encontró el área padre con ID ${createAreaDto.areaPadreId}`,
        );
      }

      // Validar que el área padre no sea una sub-área (evitar más de 2 niveles)
      if (areaPadre.areaPadreId) {
        throw new BadRequestException(
          'No se pueden crear sub-áreas de sub-áreas. Solo se permiten 2 niveles de jerarquía.',
        );
      }
    }

    // Validar que el jefe exista (si se especifica)
    if (createAreaDto.jefeId) {
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
    }

    // Crear área
    const area = await this.prisma.area.create({
      data: {
        nombre: createAreaDto.nombre,
        descripcion: createAreaDto.descripcion,
        jefeId: createAreaDto.jefeId,
        areaPadreId: createAreaDto.areaPadreId,
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
        areaPadre: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Actualizar el areaId del jefe si se especificó
    if (createAreaDto.jefeId) {
      await this.prisma.user.update({
        where: { id: createAreaDto.jefeId },
        data: { areaId: area.id },
      });
    }

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
        areaPadre: {
          select: {
            id: true,
            nombre: true,
          },
        },
        subAreas: {
          select: {
            id: true,
            nombre: true,
            activa: true,
          },
        },
        _count: {
          select: {
            empleados: true,
            kpis: true,
          },
        },
      },
      orderBy: [
        { areaPadreId: 'asc' }, // Primero las principales (null primero)
        { ranking: 'asc' },
        { nombre: 'asc' },
      ],
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
        areaPadre: {
          select: {
            id: true,
            nombre: true,
          },
        },
        subAreas: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            activa: true,
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

    // Si se actualiza el nombre, validar que no exista otro con ese nombre en el mismo nivel
    if (updateAreaDto.nombre && updateAreaDto.nombre !== areaExistente.nombre) {
      const existeNombre = await this.prisma.area.findFirst({
        where: {
          nombre: updateAreaDto.nombre,
          areaPadreId: updateAreaDto.areaPadreId ?? areaExistente.areaPadreId,
          id: { not: id },
        },
      });

      if (existeNombre) {
        throw new ConflictException(
          `Ya existe un área con el nombre "${updateAreaDto.nombre}" en este nivel`,
        );
      }
    }

    // Validar área padre si se especifica
    if (updateAreaDto.areaPadreId !== undefined) {
      if (updateAreaDto.areaPadreId) {
        // Validar que el área padre exista
        const areaPadre = await this.prisma.area.findUnique({
          where: { id: updateAreaDto.areaPadreId },
        });

        if (!areaPadre) {
          throw new NotFoundException(
            `No se encontró el área padre con ID ${updateAreaDto.areaPadreId}`,
          );
        }

        // Validar que no se asigne a sí misma como padre
        if (updateAreaDto.areaPadreId === id) {
          throw new BadRequestException(
            'Un área no puede ser padre de sí misma',
          );
        }

        // Validar que el área padre no sea una sub-área
        if (areaPadre.areaPadreId) {
          throw new BadRequestException(
            'No se pueden crear sub-áreas de sub-áreas. Solo se permiten 2 niveles de jerarquía.',
          );
        }

        // Validar que el área actual no tenga sub-áreas (no puede convertirse en sub-área si tiene hijos)
        const tieneSubAreas = await this.prisma.area.count({
          where: { areaPadreId: id },
        });

        if (tieneSubAreas > 0) {
          throw new BadRequestException(
            'No se puede convertir en sub-área porque tiene sub-áreas asignadas',
          );
        }
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
        areaPadre: {
          select: {
            id: true,
            nombre: true,
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

    // Verificar que no tenga sub-áreas
    const subAreas = await this.prisma.area.count({
      where: { areaPadreId: id },
    });

    if (subAreas > 0) {
      throw new BadRequestException(
        `No se puede eliminar el área porque tiene ${subAreas} sub-área(s). Elimina primero las sub-áreas.`,
      );
    }

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
  // OBTENER EMPLEADOS DE UN ÁREA (incluye sub-áreas)
  // ============================================
  async getEmpleados(id: string) {
    const area = await this.findOne(id);

    // Si es área padre, incluir empleados de sub-áreas
    const areasIds = [id];
    if (area.subAreas && area.subAreas.length > 0) {
      areasIds.push(...area.subAreas.map((sub) => sub.id));
    }

    const empleados = await this.prisma.user.findMany({
      where: { areaId: { in: areasIds } },
      select: {
        id: true,
        dni: true,
        nombre: true,
        apellido: true,
        email: true,
        puesto: true,
        role: true,
        activo: true,
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return empleados;
  }

  // ============================================
  // OBTENER KPIs DE UN ÁREA (incluye sub-áreas)
  // ============================================
  async getKpis(id: string) {
    const area = await this.findOne(id);

    // Si es área padre, incluir KPIs de sub-áreas
    const areasIds = [id];
    if (area.subAreas && area.subAreas.length > 0) {
      areasIds.push(...area.subAreas.map((sub) => sub.id));
    }

    const kpis = await this.prisma.kPI.findMany({
      where: { areaId: { in: areasIds }, activo: true },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { orden: 'asc' },
    });

    return kpis;
  }

  // ============================================
  // OBTENER ESTADÍSTICAS DE UN ÁREA
  // ============================================
  async getEstadisticas(id: string) {
    const area = await this.findOne(id);

    // Incluir sub-áreas si es área padre
    const areasIds = [id];
    if (area.subAreas && area.subAreas.length > 0) {
      areasIds.push(...area.subAreas.map((sub) => sub.id));
    }

    // Obtener empleados
    const empleados = await this.prisma.user.count({
      where: { areaId: { in: areasIds }, activo: true },
    });

    // Obtener KPIs
    const totalKpis = await this.prisma.kPI.count({
      where: { areaId: { in: areasIds }, activo: true },
    });

    // Obtener evaluaciones del periodo actual
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        empleado: { areaId: { in: areasIds } },
        anio: new Date().getFullYear(),
      },
      include: {
        detalles: true,
      },
    });

    // Calcular estadísticas
    const totalEvaluaciones = evaluaciones.length;
    const evaluacionesCompletadas = evaluaciones.filter(
      (e) => e.status === 'calculada' || e.status === 'cerrada',
    ).length;

    // Calcular promedio de evaluaciones
    let promedioEvaluaciones = 0;
    if (evaluacionesCompletadas > 0) {
      const suma = evaluaciones
        .filter((e) => e.status === 'calculada' || e.status === 'cerrada')
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
        esAreaPrincipal: !area.areaPadreId,
        subAreasCount: area.subAreas?.length || 0,
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

    // Incluir sub-áreas si es área padre
    const areasIds = [id];
    if (area.subAreas && area.subAreas.length > 0) {
      areasIds.push(...area.subAreas.map((sub) => sub.id));
    }

    // Obtener todas las evaluaciones completadas del área
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        empleado: { areaId: { in: areasIds } },
        status: { in: ['calculada', 'cerrada'] },
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

    // Recalcular rankings de todas las áreas principales
    await this.recalcularRankings();

    return areaActualizada;
  }

  // ============================================
  // RECALCULAR RANKINGS SOLO DE ÁREAS PRINCIPALES
  // ============================================
  async recalcularRankings() {
    // Solo rankear áreas principales (sin padre)
    const areasPrincipales = await this.prisma.area.findMany({
      where: { activa: true, areaPadreId: null },
      orderBy: { promedioGlobal: 'desc' },
    });

    // Asignar rankings
    for (let i = 0; i < areasPrincipales.length; i++) {
      await this.prisma.area.update({
        where: { id: areasPrincipales[i].id },
        data: { ranking: i + 1 },
      });
    }

    return { message: 'Rankings recalculados exitosamente' };
  }
}
