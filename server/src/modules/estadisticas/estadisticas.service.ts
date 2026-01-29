import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // ESTADÍSTICAS GLOBALES (Dashboard Admin/RRHH)
  // ============================================
  async getGlobales() {
    // Promedios y totales
    const totalEmpleados = await this.prisma.user.count({
      where: { activo: true },
    });

    const totalAreas = await this.prisma.area.count({
      where: { activa: true },
    });

    const totalKpis = await this.prisma.kPI.count({
      where: { activo: true },
    });

    // Evaluaciones
    const evaluacionesAnioActual = await this.prisma.evaluacion.findMany({
      where: {
        anio: new Date().getFullYear(),
      },
      include: {
        detalles: true,
      },
    });

    const evaluacionesCompletadas = evaluacionesAnioActual.filter(
      e => e.status === 'enviada' || e.status === 'validada',
    ).length;

    const evaluacionesPendientes = evaluacionesAnioActual.filter(e => e.status === 'borrador').length;

    const evaluacionesValidadas = evaluacionesAnioActual.filter(e => e.status === 'validada').length;

    // Calcular promedio general
    let promedioGeneral = 0;
    if (evaluacionesCompletadas > 0) {
      const suma = evaluacionesAnioActual
        .filter(e => e.status === 'enviada' || e.status === 'validada')
        .reduce((acc, e) => acc + (e.promedioGeneral || 0), 0);
      promedioGeneral = suma / evaluacionesCompletadas;
    }

    // Contar KPIs por estado
    let kpisVerdes = 0;
    let kpisAmarillos = 0;
    let kpisRojos = 0;

    evaluacionesAnioActual.forEach(evaluacion => {
      evaluacion.detalles.forEach(detalle => {
        if (detalle.estado === 'verde') kpisVerdes++;
        if (detalle.estado === 'amarillo') kpisAmarillos++;
        if (detalle.estado === 'rojo') kpisRojos++;
      });
    });

    const totalKpisEvaluados = kpisVerdes + kpisAmarillos + kpisRojos;
    const porcentajeRojos = totalKpisEvaluados > 0 ? (kpisRojos / totalKpisEvaluados) * 100 : 0;

    // Áreas en riesgo
    const areasEnRiesgo = await this.prisma.area.count({
      where: {
        activa: true,
        nivelRiesgo: { in: ['MEDIO', 'ALTO'] },
      },
    });

    return {
      recursos: {
        totalEmpleados,
        totalAreas,
        totalKpis,
      },
      evaluaciones: {
        total: evaluacionesAnioActual.length,
        completadas: evaluacionesCompletadas,
        pendientes: evaluacionesPendientes,
        validadas: evaluacionesValidadas,
        porcentajeCompletadas:
          evaluacionesAnioActual.length > 0
            ? Math.round((evaluacionesCompletadas / evaluacionesAnioActual.length) * 10000) / 100
            : 0,
      },
      desempenio: {
        promedioGeneral: Math.round(promedioGeneral * 100) / 100,
        kpisVerdes,
        kpisAmarillos,
        kpisRojos,
        totalKpisEvaluados,
        porcentajeRojos: Math.round(porcentajeRojos * 100) / 100,
      },
      riesgos: {
        areasEnRiesgo,
      },
    };
  }

  // ============================================
  // ESTADÍSTICAS POR ÁREA
  // ============================================
  async getByArea(areaId: string) {
    const area = await this.prisma.area.findUnique({
      where: { id: areaId },
      include: {
        jefe: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    if (!area) {
      throw new Error('Área no encontrada');
    }

    // Empleados del área
    const empleados = await this.prisma.user.count({
      where: { areaId, activo: true },
    });

    // KPIs del área
    const totalKpis = await this.prisma.kPI.count({
      where: { areaId, activo: true },
    });

    // Evaluaciones del área
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        empleado: { areaId },
        anio: new Date().getFullYear(),
      },
      include: {
        detalles: true,
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    const evaluacionesCompletadas = evaluaciones.filter(
      e => e.status === 'enviada' || e.status === 'validada',
    ).length;

    // Calcular promedios
    let promedioArea = 0;
    if (evaluacionesCompletadas > 0) {
      const suma = evaluaciones
        .filter(e => e.status === 'enviada' || e.status === 'validada')
        .reduce((acc, e) => acc + (e.promedioGeneral || 0), 0);
      promedioArea = suma / evaluacionesCompletadas;
    }

    // KPIs por estado
    let kpisRojos = 0;
    evaluaciones.forEach(evaluacion => {
      kpisRojos += evaluacion.detalles.filter(d => d.estado === 'rojo').length;
    });

    // Top performers del área
    const topPerformers = evaluaciones
      .filter(e => e.status === 'enviada' || e.status === 'validada')
      .sort((a, b) => (b.promedioGeneral || 0) - (a.promedioGeneral || 0))
      .slice(0, 5)
      .map(e => ({
        nombre: `${e.empleado.nombre} ${e.empleado.apellido}`,
        promedio: e.promedioGeneral,
      }));

    return {
      area: {
        id: area.id,
        nombre: area.nombre,
        jefe: area.jefe ? `${area.jefe.nombre} ${area.jefe.apellido}` : null,
        nivelRiesgo: area.nivelRiesgo,
        ranking: area.ranking,
      },
      recursos: {
        empleados,
        totalKpis,
      },
      desempenio: {
        promedioArea: Math.round(promedioArea * 100) / 100,
        kpisRojos,
        porcentajeRojos: area.porcentajeRojos,
      },
      evaluaciones: {
        total: evaluaciones.length,
        completadas: evaluacionesCompletadas,
        pendientes: evaluaciones.length - evaluacionesCompletadas,
      },
      topPerformers,
    };
  }

  // ============================================
  // ESTADÍSTICAS POR EMPLEADO
  // ============================================
  async getByEmpleado(empleadoId: string) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: empleadoId },
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
            promedioGlobal: true,
          },
        },
      },
    });

    if (!empleado) {
      throw new Error('Empleado no encontrado');
    }

    // Evaluaciones del empleado
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: { empleadoId },
      include: {
        detalles: true,
      },
      orderBy: [{ anio: 'desc' }, { createdAt: 'desc' }],
    });

    const evaluacionesCompletadas = evaluaciones.filter(
      e => e.status === 'enviada' || e.status === 'validada',
    );

    // Calcular promedio personal
    let promedioPersonal = 0;
    if (evaluacionesCompletadas.length > 0) {
      const suma = evaluacionesCompletadas.reduce((acc, e) => acc + (e.promedioGeneral || 0), 0);
      promedioPersonal = suma / evaluacionesCompletadas.length;
    }

    // Última evaluación
    const ultimaEvaluacion = evaluaciones[0] || null;

    // KPIs rojos del empleado
    let kpisRojos = 0;
    evaluaciones.forEach(evaluacion => {
      kpisRojos += evaluacion.detalles.filter(d => d.estado === 'rojo').length;
    });

    // Calcular ranking en su área
    if (empleado.areaId) {
      const empleadosArea = await this.prisma.user.findMany({
        where: {
          areaId: empleado.areaId,
          activo: true,
        },
        include: {
          evaluacionesRecibidas: {
            where: {
              status: { in: ['enviada', 'validada'] },
            },
          },
        },
      });

      const empleadosConPromedio = empleadosArea
        .map(emp => {
          const evals = emp.evaluacionesRecibidas;
          const promedio =
            evals.length > 0 ? evals.reduce((acc, e) => acc + (e.promedioGeneral || 0), 0) / evals.length : 0;
          return {
            id: emp.id,
            promedio,
          };
        })
        .sort((a, b) => b.promedio - a.promedio);

      const ranking = empleadosConPromedio.findIndex(e => e.id === empleadoId) + 1;

      return {
        empleado: {
          id: empleado.id,
          nombre: `${empleado.nombre} ${empleado.apellido}`,
          puesto: empleado.puesto,
          area: empleado.area?.nombre,
        },
        desempenio: {
          promedioPersonal: Math.round(promedioPersonal * 100) / 100,
          promedioArea: empleado.area?.promedioGlobal || 0,
          ranking,
          totalEmpleadosArea: empleadosConPromedio.length,
        },
        evaluaciones: {
          total: evaluaciones.length,
          completadas: evaluacionesCompletadas.length,
          validadas: evaluaciones.filter(e => e.status === 'validada').length,
          pendientes: evaluaciones.filter(e => e.status === 'enviada').length,
        },
        ultimaEvaluacion: ultimaEvaluacion
          ? {
              periodo: ultimaEvaluacion.periodo,
              anio: ultimaEvaluacion.anio,
              promedio: ultimaEvaluacion.promedioGeneral,
              status: ultimaEvaluacion.status,
              kpisRojos: ultimaEvaluacion.kpisRojos,
            }
          : null,
        kpisRojos,
      };
    }

    // Si no tiene área asignada
    return {
      empleado: {
        id: empleado.id,
        nombre: `${empleado.nombre} ${empleado.apellido}`,
        puesto: empleado.puesto,
        area: null,
      },
      desempenio: {
        promedioPersonal: Math.round(promedioPersonal * 100) / 100,
        promedioArea: 0,
        ranking: 0,
        totalEmpleadosArea: 0,
      },
      evaluaciones: {
        total: evaluaciones.length,
        completadas: evaluacionesCompletadas.length,
        validadas: evaluaciones.filter(e => e.status === 'validada').length,
        pendientes: evaluaciones.filter(e => e.status === 'enviada').length,
      },
      ultimaEvaluacion: ultimaEvaluacion
        ? {
            periodo: ultimaEvaluacion.periodo,
            anio: ultimaEvaluacion.anio,
            promedio: ultimaEvaluacion.promedioGeneral,
            status: ultimaEvaluacion.status,
            kpisRojos: ultimaEvaluacion.kpisRojos,
          }
        : null,
      kpisRojos,
    };
  }

  // ============================================
  // TENDENCIAS (Evolución temporal)
  // ============================================
  async getTendencias(meses: number = 6) {
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - meses);

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        createdAt: {
          gte: fechaInicio,
        },
        status: { in: ['enviada', 'validada'] },
      },
      include: {
        detalles: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Agrupar por mes
    const tendenciasPorMes: any = {};

    evaluaciones.forEach(evaluacion => {
      const fecha = new Date(evaluacion.createdAt);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      if (!tendenciasPorMes[mesKey]) {
        tendenciasPorMes[mesKey] = {
          mes: mesKey,
          cantidad: 0,
          sumaPromedios: 0,
          kpisVerdes: 0,
          kpisAmarillos: 0,
          kpisRojos: 0,
        };
      }

      tendenciasPorMes[mesKey].cantidad++;
      tendenciasPorMes[mesKey].sumaPromedios += evaluacion.promedioGeneral || 0;

      evaluacion.detalles.forEach(detalle => {
        if (detalle.estado === 'verde') tendenciasPorMes[mesKey].kpisVerdes++;
        if (detalle.estado === 'amarillo') tendenciasPorMes[mesKey].kpisAmarillos++;
        if (detalle.estado === 'rojo') tendenciasPorMes[mesKey].kpisRojos++;
      });
    });

    // Calcular promedios
    const tendencias = Object.values(tendenciasPorMes).map((mes: any) => ({
      mes: mes.mes,
      promedio: Math.round((mes.sumaPromedios / mes.cantidad) * 100) / 100,
      kpisVerdes: mes.kpisVerdes,
      kpisAmarillos: mes.kpisAmarillos,
      kpisRojos: mes.kpisRojos,
    }));

    return tendencias;
  }

  // ============================================
  // RANKINGS (Top/Bottom performers)
  // ============================================
  async getRankings() {
    // Top 5 empleados
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        status: { in: ['enviada', 'validada'] },
        anio: new Date().getFullYear(),
      },
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puesto: true,
            area: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    // Agrupar por empleado
    const empleadosMap: any = {};

    evaluaciones.forEach(evaluacion => {
      const empId = evaluacion.empleadoId;
      if (!empleadosMap[empId]) {
        empleadosMap[empId] = {
          empleado: evaluacion.empleado,
          sumaPromedios: 0,
          cantidad: 0,
        };
      }
      empleadosMap[empId].sumaPromedios += evaluacion.promedioGeneral || 0;
      empleadosMap[empId].cantidad++;
    });

    // Calcular promedios y ordenar
    const empleadosConPromedio = Object.values(empleadosMap)
      .map((emp: any) => ({
        nombre: `${emp.empleado.nombre} ${emp.empleado.apellido}`,
        puesto: emp.empleado.puesto,
        area: emp.empleado.area?.nombre,
        promedio: Math.round((emp.sumaPromedios / emp.cantidad) * 100) / 100,
      }))
      .sort((a, b) => b.promedio - a.promedio);

    const topPerformers = empleadosConPromedio.slice(0, 5);
    const bottomPerformers = empleadosConPromedio.slice(-5).reverse();

    // Ranking de áreas
    const areas = await this.prisma.area.findMany({
      where: { activa: true },
      orderBy: { promedioGlobal: 'desc' },
      select: {
        nombre: true,
        promedioGlobal: true,
        nivelRiesgo: true,
        ranking: true,
      },
    });

    return {
      topPerformers,
      bottomPerformers,
      rankingAreas: areas,
    };
  }
}