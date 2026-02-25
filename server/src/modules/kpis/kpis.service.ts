import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';

@Injectable()
export class KpisService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREAR KPI
  // ============================================
  async create(createKpiDto: CreateKpiDto) {
    // Validar que el key no exista
    const existeKey = await this.prisma.kPI.findUnique({
      where: { key: createKpiDto.key },
    });

    if (existeKey) {
      throw new ConflictException(
        `Ya existe un KPI con el key "${createKpiDto.key}"`,
      );
    }

    // Validar que el área exista
    const area = await this.prisma.area.findUnique({
      where: { id: createKpiDto.areaId },
    });

    if (!area) {
      throw new NotFoundException(
        `No se encontró el área con ID ${createKpiDto.areaId}`,
      );
    }

    // Validar que meta y tolerancia sean coherentes
    this.validarMetaYTolerancia(
      createKpiDto.meta,
      createKpiDto.tolerancia,
      createKpiDto.sentido,
    );

    // Calcular umbral amarillo
    const umbralAmarillo = this.calcularUmbralAmarillo(
      createKpiDto.meta,
      createKpiDto.tolerancia,
      createKpiDto.sentido,
    );

    // Crear KPI
    const kpi = await this.prisma.kPI.create({
      data: {
        key: createKpiDto.key,
        area: createKpiDto.area,
        areaId: createKpiDto.areaId,
        puesto: createKpiDto.puesto,
        indicador: createKpiDto.indicador,
        descripcion: createKpiDto.descripcion,
        formula: createKpiDto.formula,
        meta: createKpiDto.meta,
        tolerancia: createKpiDto.tolerancia,
        umbralAmarillo,
        periodicidad: createKpiDto.periodicidad,
        sentido: createKpiDto.sentido,
        unidad: createKpiDto.unidad,
        orden: createKpiDto.orden ?? 0,
        activo: createKpiDto.activo ?? true,
      },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return kpi;
  }

  // ============================================
  // LISTAR TODOS LOS KPIs
  // ============================================
  async findAll(filters?: {
    areaId?: string;
    puesto?: string;
    activo?: boolean;
  }) {
    const where: any = {};

    if (filters?.areaId) {
      where.areaId = filters.areaId;
    }

    if (filters?.puesto) {
      where.puesto = filters.puesto;
    }

    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    const kpis = await this.prisma.kPI.findMany({
      where,
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [{ areaId: 'asc' }, { orden: 'asc' }],
    });

    return kpis;
  }

  // ============================================
  // OBTENER UN KPI POR ID
  // ============================================
  async findOne(id: string) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
        evaluacionDetalles: {
          select: {
            id: true,
            resultadoNumerico: true,
            resultadoPorcentaje: true,
            estado: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!kpi) {
      throw new NotFoundException(`No se encontró el KPI con ID ${id}`);
    }

    return kpi;
  }

  // ============================================
  // OBTENER KPI POR KEY
  // ============================================
  async findByKey(key: string) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { key },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!kpi) {
      throw new NotFoundException(`No se encontró el KPI con key "${key}"`);
    }

    return kpi;
  }

  // ============================================
  // OBTENER KPIs POR ÁREA
  // ============================================
  async findByArea(areaId: string) {
    const area = await this.prisma.area.findUnique({
      where: { id: areaId },
    });

    if (!area) {
      throw new NotFoundException(`No se encontró el área con ID ${areaId}`);
    }

    const kpis = await this.prisma.kPI.findMany({
      where: { areaId, activo: true },
      orderBy: { orden: 'asc' },
    });

    return kpis;
  }

  // ============================================
  // OBTENER KPIs POR PUESTO
  // ============================================
  async findByPuesto(puesto: string) {
    const kpis = await this.prisma.kPI.findMany({
      where: {
        OR: [{ puesto }, { puesto: null }],
        activo: true,
      },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [{ areaId: 'asc' }, { orden: 'asc' }],
    });

    return kpis;
  }

  // ============================================
  // ACTUALIZAR KPI
  // ============================================
  async update(id: string, updateKpiDto: UpdateKpiDto) {
    // Verificar que el KPI existe
    const kpiExistente = await this.findOne(id);

    // Si se actualiza el key, validar que no exista otro con ese key
    if (updateKpiDto.key && updateKpiDto.key !== kpiExistente.key) {
      const existeKey = await this.prisma.kPI.findUnique({
        where: { key: updateKpiDto.key },
      });

      if (existeKey) {
        throw new ConflictException(
          `Ya existe un KPI con el key "${updateKpiDto.key}"`,
        );
      }
    }

    // Si se actualiza el área, validar que exista
    if (updateKpiDto.areaId && updateKpiDto.areaId !== kpiExistente.areaId) {
      const area = await this.prisma.area.findUnique({
        where: { id: updateKpiDto.areaId },
      });

      if (!area) {
        throw new NotFoundException(
          `No se encontró el área con ID ${updateKpiDto.areaId}`,
        );
      }
    }

    // Si se actualizan meta, tolerancia o sentido, recalcular umbral
    let umbralAmarillo = kpiExistente.umbralAmarillo;
    const meta = updateKpiDto.meta ?? kpiExistente.meta;
    const tolerancia = updateKpiDto.tolerancia ?? kpiExistente.tolerancia;
    const sentido = updateKpiDto.sentido ?? kpiExistente.sentido;

    if (updateKpiDto.meta || updateKpiDto.tolerancia || updateKpiDto.sentido) {
      this.validarMetaYTolerancia(meta, tolerancia, sentido);
      umbralAmarillo = this.calcularUmbralAmarillo(meta, tolerancia, sentido);
    }

    const kpi = await this.prisma.kPI.update({
      where: { id },
      data: {
        ...updateKpiDto,
        umbralAmarillo,
      },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return kpi;
  }

  // ============================================
  // ELIMINAR KPI
  // ============================================
  async remove(id: string) {
    // Verificar que el KPI existe
    await this.findOne(id);

    // Verificar que no tenga evaluaciones asociadas
    const evaluaciones = await this.prisma.evaluacionDetalle.count({
      where: { kpiId: id },
    });

    if (evaluaciones > 0) {
      throw new BadRequestException(
        `No se puede eliminar el KPI porque tiene ${evaluaciones} evaluación(es) asociada(s). Considere desactivarlo en su lugar.`,
      );
    }

    await this.prisma.kPI.delete({
      where: { id },
    });

    return { message: 'KPI eliminado exitosamente' };
  }

  // ============================================
  // DESACTIVAR/ACTIVAR KPI
  // ============================================
  async toggleActivo(id: string) {
    const kpi = await this.findOne(id);

    const kpiActualizado = await this.prisma.kPI.update({
      where: { id },
      data: { activo: !kpi.activo },
    });

    return {
      message: `KPI ${kpiActualizado.activo ? 'activado' : 'desactivado'} exitosamente`,
      kpi: kpiActualizado,
    };
  }

  // ============================================
  // OBTENER ESTADÍSTICAS DE UN KPI
  // ============================================
  async getEstadisticas(id: string) {
    const kpi = await this.findOne(id);

    // Obtener todas las evaluaciones de este KPI
    const evaluaciones = await this.prisma.evaluacionDetalle.findMany({
      where: { kpiId: id },
      include: {
        evaluacion: {
          select: {
            periodo: true,
            anio: true,
            status: true,
          },
        },
      },
    });

    if (evaluaciones.length === 0) {
      return {
        kpi: {
          id: kpi.id,
          key: kpi.key,
          indicador: kpi.indicador,
          meta: kpi.meta,
        },
        estadisticas: {
          totalEvaluaciones: 0,
          promedioResultado: 0,
          verdes: 0,
          amarillos: 0,
          rojos: 0,
          porcentajeVerdes: 0,
          porcentajeAmarillos: 0,
          porcentajeRojos: 0,
        },
      };
    }

    // Calcular estadísticas
    const totalEvaluaciones = evaluaciones.length;
    const sumaResultados = evaluaciones.reduce(
      (acc, e) => acc + e.resultadoPorcentaje!,
      0,
    );
    const promedioResultado = sumaResultados / totalEvaluaciones;

    const verdes = evaluaciones.filter((e) => e.estado === 'verde').length;
    const amarillos = evaluaciones.filter(
      (e) => e.estado === 'amarillo',
    ).length;
    const rojos = evaluaciones.filter((e) => e.estado === 'rojo').length;

    return {
      kpi: {
        id: kpi.id,
        key: kpi.key,
        indicador: kpi.indicador,
        meta: kpi.meta,
        area: kpi.area,
      },
      estadisticas: {
        totalEvaluaciones,
        promedioResultado: Math.round(promedioResultado * 100) / 100,
        verdes,
        amarillos,
        rojos,
        porcentajeVerdes:
          Math.round((verdes / totalEvaluaciones) * 10000) / 100,
        porcentajeAmarillos:
          Math.round((amarillos / totalEvaluaciones) * 10000) / 100,
        porcentajeRojos: Math.round((rojos / totalEvaluaciones) * 10000) / 100,
      },
      ultimasEvaluaciones: evaluaciones.slice(0, 5).map((e) => ({
        periodo: e.evaluacion.periodo,
        anio: e.evaluacion.anio,
        resultado: e.resultadoNumerico,
        porcentaje: e.resultadoPorcentaje,
        estado: e.estado,
      })),
    };
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private validarMetaYTolerancia(
    meta: number,
    tolerancia: number,
    sentido: string,
  ) {
    if (meta <= 0) {
      throw new BadRequestException('La meta debe ser mayor a 0');
    }

    if (sentido === 'Mayor es mejor' && tolerancia > 0) {
      throw new BadRequestException(
        'Para KPIs donde "Mayor es mejor", la tolerancia debe ser negativa (ej: -5)',
      );
    }

    if (sentido === 'Menor es mejor' && tolerancia < 0) {
      throw new BadRequestException(
        'Para KPIs donde "Menor es mejor", la tolerancia debe ser positiva (ej: +5)',
      );
    }
  }

  private calcularUmbralAmarillo(
    meta: number,
    tolerancia: number,
    sentido: string,
  ): number {
    if (sentido === 'Mayor es mejor') {
      // Ej: meta = 90, tolerancia = -5 → umbral = 85
      return meta + tolerancia;
    } else {
      // Ej: meta = 30, tolerancia = +5 → umbral = 35
      return meta + tolerancia;
    }
  }

  // ============================================
  // REORDENAR KPIs DE UN ÁREA
  // ============================================
  async reordenar(areaId: string, orden: { id: string; orden: number }[]) {
    const area = await this.prisma.area.findUnique({
      where: { id: areaId },
    });

    if (!area) {
      throw new NotFoundException(`No se encontró el área con ID ${areaId}`);
    }

    // Actualizar el orden de cada KPI
    const updates = orden.map((item) =>
      this.prisma.kPI.update({
        where: { id: item.id },
        data: { orden: item.orden },
      }),
    );

    await Promise.all(updates);

    return { message: 'KPIs reordenados exitosamente' };
  }
}
