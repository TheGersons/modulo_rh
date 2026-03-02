import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedKPIsAdministrativos() {
  console.log('🎯 Iniciando seed de KPIs Administrativos...\n');

  // Obtener área Administrativa
  const areaAdministrativa = await prisma.area.findFirst({
    where: { nombre: 'Administrativa', areaPadreId: null },
  });

  if (!areaAdministrativa) {
    throw new Error('❌ No se encontró el área Administrativa');
  }

  console.log(`✅ Área Administrativa encontrada: ${areaAdministrativa.id}\n`);

  // ==============================================
  // SUB-ÁREA: GERENCIA
  // ==============================================
  console.log('📁 Procesando KPIs de Gerencia...');

  const subAreaGerencia = await prisma.area.findFirst({
    where: { nombre: 'Gerencia', areaPadreId: areaAdministrativa.id },
  });

  if (!subAreaGerencia) {
    console.log('⚠️  Sub-área Gerencia no encontrada, saltando...\n');
  } else {
    const puestoGerenciaAdmin = await prisma.puesto.findFirst({
      where: { nombre: 'Gerencia Administrativa', areaId: subAreaGerencia.id },
    });

    if (!puestoGerenciaAdmin) {
      console.log('⚠️  Puesto "Gerencia Administrativa" no encontrado\n');
    } else {
      const kpisGerencia = [
        {
          key: 'GER-FIN-001',
          indicador: 'Uso del sistema interbanca confiable',
          areaId: subAreaGerencia.id,
          puestoId: puestoGerenciaAdmin.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            tipo: 'porcentaje',
            descripcion: 'Transacciones documentadas y sin errores',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'GER-FIN-002',
          indicador: 'Disciplina presupuestaria',
          areaId: subAreaGerencia.id,
          puestoId: puestoGerenciaAdmin.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            tipo: 'formula',
            descripcion: '(Gasto real / Presupuesto aprobado) × 100',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'trimestral',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'GER-INC-001',
          indicador: 'Registro y alarmas de incidentes',
          areaId: subAreaGerencia.id,
          puestoId: puestoGerenciaAdmin.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            tipo: 'porcentaje',
            descripcion: 'Reportes del incidentes',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'trimestral',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'GER-RIE-001',
          indicador: 'Actualización de Riesgo financiero de la empresa',
          areaId: subAreaGerencia.id,
          puestoId: puestoGerenciaAdmin.id,
          tipoCalculo: 'binario',
          formulaCalculo: JSON.stringify({
            tipo: 'binario',
            descripcion: 'Presentación de análisis de riesgos mensual',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'trimestral',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'GER-EQU-001',
          indicador: 'KPIs Verde del team',
          areaId: subAreaGerencia.id,
          puestoId: puestoGerenciaAdmin.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            tipo: 'porcentaje',
            descripcion: '100% de KPIs verde',
          }),
          meta: 90,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'GER-REP-001',
          indicador: 'Presentación de Dashboards',
          areaId: subAreaGerencia.id,
          puestoId: puestoGerenciaAdmin.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            tipo: 'porcentaje',
            descripcion: 'Dashboards de KPIs de las áreas',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpiData of kpisGerencia) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpiData.key },
        });

        if (existente) {
          console.log(`  ⏭️  KPI ${kpiData.key} ya existe`);
        } else {
          const { areaId, puestoId, ...data } = kpiData;
          const kpi = await prisma.kPI.create({
            data: {
              ...data,
              area: { connect: { id: areaId } },
              puesto: { connect: { id: puestoId } },
            },
          });
          console.log(`  ✅ KPI ${kpiData.key} creado`);
        }
      }

      console.log(`✅ KPIs de Gerencia completados\n`);
    }
  }

  // ==============================================
  // SUB-ÁREA: ADMINISTRACIÓN
  // ==============================================
  console.log('📁 Procesando KPIs de Administración...');

  const subAreaAdministracion = await prisma.area.findFirst({
    where: { nombre: 'Administración', areaPadreId: areaAdministrativa.id },
  });

  if (!subAreaAdministracion) {
    console.log('⚠️  Sub-área Administración no encontrada, saltando...\n');
  } else {
    // PUESTO: Analista Financiero
    const puestoAnalistaFinanciero = await prisma.puesto.findFirst({
      where: {
        nombre: 'Analista Financiero',
        areaId: subAreaAdministracion.id,
      },
    });

    if (puestoAnalistaFinanciero) {
      const kpisAnalistaFinanciero = [
        {
          key: 'ADM-FIN-001',
          indicador: 'Exactitud proyección flujo',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Exactitud proyección flujo ±5%',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-FIN-002',
          indicador: 'Liquidez corriente',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Liquidez corriente ≥ 1.2',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-FIN-003',
          indicador: 'Capital de trabajo óptimo',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Capital de trabajo óptimo=100%',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-FIN-004',
          indicador: 'Días cuentas por cobrar',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Días cuentas por cobrar < 60 días',
          }),
          meta: 90,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'ADM-REN-001',
          indicador: 'Margen',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Margen real vs margen presupuestado (variación <5%)',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-REN-002',
          indicador: 'Desviación de PPTOs de Proyectos',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Proyectos con desviación >10% (meta 0)',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'ADM-REN-003',
          indicador: 'EBITDA',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'EBITDA mensual dentro objetivo',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-REN-004',
          indicador: 'Control de costos',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Control de costos indirectos',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-PPT-001',
          indicador: 'Uso de PPTO Operativo',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reporte real vs presupuesto antes día 10',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-PPT-002',
          indicador: 'Desviaciones detectadas',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Desviaciones detectadas anticipadamente',
          }),
          meta: 90,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-PPT-003',
          indicador: 'Reducción de gastos',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: '% reducción gastos innecesarios',
          }),
          meta: 7,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-EST-001',
          indicador: 'Evaluaciones financieras',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Evaluaciones financieras de inversiones',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-EST-002',
          indicador: 'Análisis de sensibilidad',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Análisis de sensibilidad entregado en cada proyecto > $200k',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-EST-003',
          indicador: 'Modelos financieros',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: 'Preparación modelo financiero bancable',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-GEN-001',
          indicador: 'Informes (dashboards)',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAnalistaFinanciero.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Entrega de informes <según requerimiento',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisAnalistaFinanciero) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Encargado de Asuntos Legales
    const puestoAsuntosLegales = await prisma.puesto.findFirst({
      where: {
        nombre: 'Encargado de Asuntos Legales',
        areaId: subAreaAdministracion.id,
      },
    });

    if (puestoAsuntosLegales) {
      const kpisAsuntosLegales = [
        {
          key: 'ADM-LEG-001',
          indicador: 'Gestión de Contratos',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAsuntosLegales.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Contratos revisados y aprobados',
          }),
          meta: 2,
          unidad: 'días',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LEG-002',
          indicador: 'Cumplimiento de obligaciones legales aplicables',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAsuntosLegales.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Atención de Obligaciones contractuales conforme a requisitos=100%',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LEG-003',
          indicador: 'Matriz de Riesgo',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAsuntosLegales.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Presentar matriz trimestralmente',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'trimestral',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LEG-004',
          indicador: 'Gestión de Riesgos Legales',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAsuntosLegales.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: '(Riesgos mitigados / Riesgos identificados) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LEG-005',
          indicador: 'Tiempo de respuesta legal interna',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAsuntosLegales.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Atención de solicitudes internas',
          }),
          meta: 2,
          unidad: 'días',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LEG-006',
          indicador: 'Tablero de Control',
          areaId: subAreaAdministracion.id,
          puestoId: puestoAsuntosLegales.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Tablero de control actualizado',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisAsuntosLegales) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Encargado de Logística
    const puestoLogistica = await prisma.puesto.findFirst({
      where: {
        nombre: 'Encargado de Logística',
        areaId: subAreaAdministracion.id,
      },
    });

    if (puestoLogistica) {
      const kpisLogistica = [
        {
          key: 'ADM-LOG-001',
          indicador: 'Cumplimiento de atención logística',
          areaId: subAreaAdministracion.id,
          puestoId: puestoLogistica.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Tiempo de respuesta conforme a requerimiento del cliente',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LOG-002',
          indicador: 'Actualización de Pólizas',
          areaId: subAreaAdministracion.id,
          puestoId: puestoLogistica.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Cumplimiento del plan de renovación de Pólizas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LOG-003',
          indicador: 'Ejecución de Reclamos',
          areaId: subAreaAdministracion.id,
          puestoId: puestoLogistica.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Reclamos de seguros ejecutado/Reclamos de seguros solicitados X 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LOG-004',
          indicador: 'Reporte de incidencias',
          areaId: subAreaAdministracion.id,
          puestoId: puestoLogistica.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reporte de incidencias',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LOG-005',
          indicador:
            'Auditoría de Trazabilidad de Documentación del Producto/equipo salida/entrega',
          areaId: subAreaAdministracion.id,
          puestoId: puestoLogistica.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reporte de auditoria',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-LOG-006',
          indicador:
            'Cumplimiento de presupuestos asignados a la logística requerida',
          areaId: subAreaAdministracion.id,
          puestoId: puestoLogistica.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion: '((Costo real – Presupuesto) / Presupuesto) × 100',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisLogistica) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Auxiliar de Mantenimiento Plantel
    const puestoMantenimientoPlantel = await prisma.puesto.findFirst({
      where: {
        nombre: 'Auxiliar de Mantenimiento Plantel',
        areaId: subAreaAdministracion.id,
      },
    });

    if (puestoMantenimientoPlantel) {
      const kpisMantenimientoPlantel = [
        {
          key: 'ADM-MAN-001',
          indicador: 'Cumplimiento del mantenimiento preventivo',
          areaId: subAreaAdministracion.id,
          puestoId: puestoMantenimientoPlantel.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Ejecución del plan de mantenimiento preventivo',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-MAN-002',
          indicador: 'Ejecución de solicitudes correctivas',
          areaId: subAreaAdministracion.id,
          puestoId: puestoMantenimientoPlantel.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Ejecución de solicitud',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ADM-MAN-003',
          indicador: 'Calidad de ejecución',
          areaId: subAreaAdministracion.id,
          puestoId: puestoMantenimientoPlantel.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({ descripcion: 'Quejas formales' }),
          meta: 0,
          unidad: 'quejas',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisMantenimientoPlantel) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    console.log(`✅ KPIs de Administración completados\n`);
  }

  // ==============================================
  // SUB-ÁREA: FLOTA VEHICULAR
  // ==============================================
  console.log('📁 Procesando KPIs de Flota Vehicular...');

  const subAreaFlotaVehicular = await prisma.area.findFirst({
    where: { nombre: 'Flota Vehicular', areaPadreId: areaAdministrativa.id },
  });

  if (!subAreaFlotaVehicular) {
    console.log('⚠️  Sub-área Flota Vehicular no encontrada, saltando...\n');
  } else {
    const puestoEncargadoFlota = await prisma.puesto.findFirst({
      where: {
        nombre: 'Encargado de flota vehicular',
        areaId: subAreaFlotaVehicular.id,
      },
    });

    if (puestoEncargadoFlota) {
      const kpisFlota = [
        {
          key: 'FLO-MAN-001',
          indicador: 'Registro de presupuesto de mantenimiento Preventivo',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Registro de costo de mantenimiento preventivo por vehículo',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'FLO-MAN-002',
          indicador:
            'Registro de presupuesto de mantenimiento Correctivo menor',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Registro de costo de mantenimiento Correctivo menor por vehículo',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'FLO-MAN-003',
          indicador:
            'Registro de presupuesto de mantenimiento Correctivo mayor',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Registro de costo de mantenimiento Correctivo mayor por vehículo',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'FLO-PRO-001',
          indicador:
            'Cumplimiento de Proceso de Contratación de talleres para mantenimientos',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Auditoria que valida el cumplimiento',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'FLO-PRO-002',
          indicador: 'Medición de calidad y no pago doble por reparaciones',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'conteo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Número de reclamos por misma falla de un vehículo',
          }),
          meta: 0,
          unidad: 'reclamos',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'FLO-COS-001',
          indicador: 'Disciplina presupuestaria',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Costo real de mantenimiento por vehículo / Costo presupuestado) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'FLO-TIE-001',
          indicador: 'Servicio al cliente interno por manto correctivo',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Tiempo de respuesta después de la solicitud',
          }),
          meta: 24,
          unidad: 'horas',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'FLO-ENT-001',
          indicador: 'Entrega del vehículo sin rechazo reparación menor',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Tiempo de entrega del vehículo en reparaciones menor',
          }),
          meta: 72,
          unidad: 'horas',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'FLO-ENT-002',
          indicador: 'Entrega del vehículo sin rechazo reparación mayor',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Tiempo de entrega del vehículo en reparaciones menor',
          }),
          meta: 15,
          unidad: 'días',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'FLO-ENT-003',
          indicador: 'Entrega del vehículo sin rechazo cambio de aceite',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Tiempo de entrega del vehículo por cambio de aceite',
          }),
          meta: 8,
          unidad: 'horas',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'FLO-REP-001',
          indicador: 'Entrega de Dashboard por áreas de la empresa',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Dashboard actualizado por el 100% de flota vehicular',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'FLO-GES-001',
          indicador: 'Gestión y cuidado de los activos de la empresa',
          areaId: subAreaFlotaVehicular.id,
          puestoId: puestoEncargadoFlota.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Casos con deducción o acta de responsabilidad aplicada / Casos de daño atribuible al usuario) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisFlota) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }

      console.log(`✅ KPIs de Flota Vehicular completados\n`);
    }
  }

  // ==============================================
  // SUB-ÁREA: ISO
  // ==============================================
  console.log('📁 Procesando KPIs de ISO...');

  const subAreaISO = await prisma.area.findFirst({
    where: { nombre: 'ISO', areaPadreId: areaAdministrativa.id },
  });

  if (!subAreaISO) {
    console.log('⚠️  Sub-área ISO no encontrada, saltando...\n');
  } else {
    // PUESTO: Oficial ISO / Gestor de Procesos
    const puestoOficialISO = await prisma.puesto.findFirst({
      where: {
        OR: [
          { nombre: 'Oficial ISO', areaId: subAreaISO.id },
          { nombre: 'Gestor de Procesos', areaId: subAreaISO.id },
        ],
      },
    });

    if (puestoOficialISO) {
      const kpisOficialISO = [
        {
          key: 'ISO-CER-001',
          indicador:
            'Certificación ISO – Auditorías sin no conformidades mayores',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Auditorías sin No Conformidades Mayores / Total auditorías realizadas) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'anual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-DOC-001',
          indicador: 'Auditorías de Documentación',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Auditar el 100% de las áreas documentos actualizados',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-PRO-001',
          indicador: 'Auditorías de Procesos',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Auditar el 100% de las áreas procesos actualizados',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-INC-001',
          indicador: 'Reportes de incidencias del SGC',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reportes de incidencias del SGC',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-AUD-001',
          indicador: 'Auditar acciones correctivas',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Auditar el 100% de las áreas con acciones correctivas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-CAP-001',
          indicador: 'Cumplimiento del Plan de capacitación/certificación',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Cumplimiento del plan',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-POR-001',
          indicador: 'Portal actualizado',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Auditoria al portal para validar actualización',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-CUL-001',
          indicador: 'Medición de Cultura de gestión por procesos',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Áreas que trabajan por procesos/ total de áreas de la empresa X 100',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'trimestral',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-RET-001',
          indicador: 'Medición de retrabajos o reprocesos por áreas',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Entrega de Dashboard de KPIs por trabajo/proceso del 100% áreas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-DAS-001',
          indicador: 'Actualización de Dashboards de las áreas',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Presentación de Dashboards actualizados',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-VAL-001',
          indicador:
            'Auditoría que valida que doc publicados están al 100% y actualizados',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Informe de auditoria de doc actualizada y de todas las áreas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-NOC-001',
          indicador: 'No Conformidades del SGC de usuarios',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'conteo',
          formulaCalculo: JSON.stringify({
            descripcion: 'No Conformidades del SGC',
          }),
          meta: 0,
          unidad: 'no conformidades',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'ISO-5S-001',
          indicador: 'Auditoría de 5S',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Auditar el 100% de las áreas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-EQU-001',
          indicador: 'Cumplimiento de KPIs del equipo',
          areaId: subAreaISO.id,
          puestoId: puestoOficialISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'KPIs del equipo contable= verde',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisOficialISO) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Auxiliar ISO
    const puestoAuxiliarISO = await prisma.puesto.findFirst({
      where: { nombre: 'Auxiliar ISO', areaId: subAreaISO.id },
    });

    if (puestoAuxiliarISO) {
      const kpisAuxiliarISO = [
        {
          key: 'ISO-AUX-001',
          indicador: 'Documentación SGC actualizada',
          areaId: subAreaISO.id,
          puestoId: puestoAuxiliarISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Informe de auditoria de doc actualizada y de todas las áreas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-AUX-002',
          indicador: 'Registro de ejecución de acciones coorrectivas',
          areaId: subAreaISO.id,
          puestoId: puestoAuxiliarISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Acciones correctivas con seguimiento oportuno y evidencia cargada / Total acciones asignadas) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-AUX-003',
          indicador: 'Ejecución del plan annual',
          areaId: subAreaISO.id,
          puestoId: puestoAuxiliarISO.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Ejecución de auditorías conforme al plan',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'trimestral',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'ISO-AUX-004',
          indicador: 'Ejecutar auditorías requeridas',
          areaId: subAreaISO.id,
          puestoId: puestoAuxiliarISO.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '# de auditorías o seguimientos ejecutados/ Total de auditorías o seguimientos solicitados X 100',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'trimestral',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisAuxiliarISO) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    console.log(`✅ KPIs de ISO completados\n`);
  }

  // ==============================================
  // SUB-ÁREA: SYSO
  // ==============================================
  console.log('📁 Procesando KPIs de SYSO...');

  const subAreaSYSO = await prisma.area.findFirst({
    where: { nombre: 'SYSO', areaPadreId: areaAdministrativa.id },
  });

  if (!subAreaSYSO) {
    console.log('⚠️  Sub-área SYSO no encontrada, saltando...\n');
  } else {
    // PUESTO: Oficial de SYSO Unidades de Negocio
    const puestoSYSOUnidades = await prisma.puesto.findFirst({
      where: {
        nombre: 'Oficial de SYSO Unidades de Negocio',
        areaId: subAreaSYSO.id,
      },
    });

    if (puestoSYSOUnidades) {
      const kpisSYSOUnidades = [
        {
          key: 'SYS-UNI-001',
          indicador: 'Auditorías de Formularios llenados de SYSO por trabajo',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOUnidades.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Informe de auditoria realizado',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'SYS-UNI-002',
          indicador: 'Auditorías internas/externas, almenos 2 por semanas',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOUnidades.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Entrega de informe de auditorías ejecutadas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'SYS-UNI-003',
          indicador: 'Informe preliminar',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOUnidades.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Entrega del informe preliminar del accidente',
          }),
          meta: 12,
          unidad: 'horas',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'SYS-UNI-004',
          indicador: 'Gestión de riesgos',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOUnidades.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Ejecución y/o gestión de acciones correctivas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'SYS-UNI-005',
          indicador: 'Personal con Seguro contra accidente',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOUnidades.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Comprobación 100% del personal esté asegurado',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisSYSOUnidades) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Oficial de SYSO Proyectos
    const puestoSYSOProyectos = await prisma.puesto.findFirst({
      where: { nombre: 'Oficial de SYSO Proyectos', areaId: subAreaSYSO.id },
    });

    if (puestoSYSOProyectos) {
      const kpisSYSOProyectos = [
        {
          key: 'SYS-PRO-001',
          indicador: 'Ocurrencia de accidentes graves/mortales',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOProyectos.id,
          tipoCalculo: 'conteo',
          formulaCalculo: JSON.stringify({
            descripcion: '# de accidentes ocurridos graves/mortales',
          }),
          meta: 0,
          unidad: 'accidentes',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'SYS-PRO-002',
          indicador: 'Ocurrencia de accidentes menores',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOProyectos.id,
          tipoCalculo: 'conteo',
          formulaCalculo: JSON.stringify({
            descripcion: '# de accidentes ocurridos graves/mortales',
          }),
          meta: 0,
          unidad: 'accidentes',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'SYS-PRO-003',
          indicador: 'Reporte del incidente',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOProyectos.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: '# de reportes de incidentes',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'SYS-PRO-004',
          indicador: 'Auditorías de Formularios llenados de SYSO por trabajo',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOProyectos.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Informe de auditoria realizado',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'SYS-PRO-005',
          indicador: 'Auditorías internas/externas, almenos 2 por semanas',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOProyectos.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Entrega de informe de auditorías ejecutadas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'SYS-PRO-006',
          indicador: 'Informe preliminar',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOProyectos.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Entrega del informe preliminar del accidente',
          }),
          meta: 12,
          unidad: 'horas',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'SYS-PRO-007',
          indicador: 'Gestión de riesgos',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOProyectos.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Ejecución y/o gestión de acciones correctivas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'SYS-PRO-008',
          indicador: 'Personal con Seguro contra accidente',
          areaId: subAreaSYSO.id,
          puestoId: puestoSYSOProyectos.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Comprobación 100% del personal esté asegurado',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisSYSOProyectos) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    console.log(`✅ KPIs de SYSO completados\n`);
  }

  // ==============================================
  // SUB-ÁREA: CONTABILIDAD
  // ==============================================
  console.log('📁 Procesando KPIs de Contabilidad...');

  const subAreaContabilidad = await prisma.area.findFirst({
    where: { nombre: 'Contabilidad', areaPadreId: areaAdministrativa.id },
  });

  if (!subAreaContabilidad) {
    console.log('⚠️  Sub-área Contabilidad no encontrada, saltando...\n');
  } else {
    // PUESTO: Contador General
    const puestoContadorGeneral = await prisma.puesto.findFirst({
      where: { nombre: 'Contador General', areaId: subAreaContabilidad.id },
    });

    if (puestoContadorGeneral) {
      const kpisContadorGeneral = [
        {
          key: 'CON-GEN-001',
          indicador:
            'Estados financieros confiables por empresa/unidad/proyecto',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorGeneral.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Estados financieros sin ajustes posteriores / Total estados emitidos) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-GEN-002',
          indicador: 'Reporte de alarmas/incidencias',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorGeneral.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reporte de alarmas/incidencias =100%',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-GEN-003',
          indicador: 'Información contable actualizada',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorGeneral.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Reporte auditoria > 95% de la información actualizada',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-GEN-004',
          indicador: 'Cumplimiento fiscal sin sanciones',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorGeneral.id,
          tipoCalculo: 'conteo',
          formulaCalculo: JSON.stringify({
            descripcion: '# sanciones fiscales',
          }),
          meta: 0,
          unidad: 'sanciones',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'CON-GEN-005',
          indicador: 'Cierre contable oportuno anual',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorGeneral.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({ descripcion: 'Cierre contable' }),
          meta: 10,
          unidad: 'días',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'CON-GEN-006',
          indicador: 'Cierre contable oportuno mensual',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorGeneral.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({ descripcion: 'Cierre contable' }),
          meta: 8,
          unidad: 'días',
          periodicidad: 'anual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'CON-GEN-007',
          indicador: 'Reportes financieros útiles y oportunos',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorGeneral.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Reporte entregado sin rechazo < antes del 12 de cada mes',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-GEN-008',
          indicador: 'Cumplimiento de KPIs del equipo',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorGeneral.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'KPIs del equipo contable= verde',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisContadorGeneral) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Auditor de Viáticos/Inventario
    const puestoAuditor = await prisma.puesto.findFirst({
      where: {
        nombre: 'Auditor de Viáticos/Inventario',
        areaId: subAreaContabilidad.id,
      },
    });

    if (puestoAuditor) {
      const kpisAuditor = [
        {
          key: 'CON-AUD-001',
          indicador: 'Control y Existencia de Activos Fijos',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuditor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reporte de Auditoria',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-AUD-002',
          indicador: 'Confiabilidad del Inventario Auditado',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuditor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reporte de auditoria',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-AUD-003',
          indicador: 'Gestión de activos de Proyectos',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuditor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reporte de auditorías en almacenes',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-AUD-004',
          indicador: 'Cumplimiento del Reglamento de Viáticos',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuditor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Reporte de auditoria',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-AUD-005',
          indicador: 'Calidad y Oportunidad de informes',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuditor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Informes entregados sin reproceso y a tiempo',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisAuditor) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Contador Jr.
    const puestoContadorJr = await prisma.puesto.findFirst({
      where: { nombre: 'Contador Jr.', areaId: subAreaContabilidad.id },
    });

    if (puestoContadorJr) {
      const kpisContadorJr = [
        {
          key: 'CON-JR-001',
          indicador: 'Ejecución de la actividad contable sin reprocesos',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorJr.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Revisión de registros sin reproceso',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-JR-002',
          indicador: 'Estados financieros sin ajustes posteriores',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorJr.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Estados financieros en tiempo y sin rechazo',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-JR-003',
          indicador: 'Cumplimiento del cierre contable',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorJr.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Cierre contable entregado',
          }),
          meta: 5,
          unidad: 'días',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'CON-JR-004',
          indicador: 'Soporte Documental Contable',
          areaId: subAreaContabilidad.id,
          puestoId: puestoContadorJr.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Reporte de auditoria Documental contable completa y válida',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisContadorJr) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Auxiliar Contable
    const puestoAuxiliarContable = await prisma.puesto.findFirst({
      where: { nombre: 'Auxiliar Contable', areaId: subAreaContabilidad.id },
    });

    if (puestoAuxiliarContable) {
      const kpisAuxiliarContable = [
        {
          key: 'CON-AUX-001',
          indicador: 'Ejecución de la actividad contable sin reprocesos',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuxiliarContable.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Revisión de registros sin reproceso',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-AUX-002',
          indicador: 'Estados financieros sin ajustes posteriores',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuxiliarContable.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Estados financieros en tiempo y sin rechazo',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'CON-AUX-003',
          indicador: 'Cumplimiento del cierre contable',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuxiliarContable.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Cierre contable entregado',
          }),
          meta: 5,
          unidad: 'días',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'CON-AUX-004',
          indicador: 'Soporte Documental Contable',
          areaId: subAreaContabilidad.id,
          puestoId: puestoAuxiliarContable.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Reporte de auditoria Documental contable completa y válida',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisAuxiliarContable) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    console.log(`✅ KPIs de Contabilidad completados\n`);
  }

  // ==============================================
  // SUB-ÁREA: RECURSOS HUMANOS
  // ==============================================
  console.log('📁 Procesando KPIs de Recursos Humanos...');

  const subAreaRRHH = await prisma.area.findFirst({
    where: { nombre: 'Recursos Humanos', areaPadreId: areaAdministrativa.id },
  });

  if (!subAreaRRHH) {
    console.log('⚠️  Sub-área Recursos Humanos no encontrada, saltando...\n');
  } else {
    // PUESTO: Asistente de Recursos Humanos / Recepción
    const puestoAsistenteRRHH = await prisma.puesto.findFirst({
      where: {
        OR: [
          { nombre: 'Asistente de Recursos Humanos', areaId: subAreaRRHH.id },
          { nombre: 'Recepción', areaId: subAreaRRHH.id },
        ],
      },
    });

    if (puestoAsistenteRRHH) {
      const kpisAsistenteRRHH = [
        {
          key: 'RRHH-ASI-001',
          indicador:
            'Auditoría de Exactitud de Actualización de Información del Personal',
          areaId: subAreaRRHH.id,
          puestoId: puestoAsistenteRRHH.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Auditoria (Registros correctos y actualizados ÷ Total de registros revisados) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-ASI-002',
          indicador: 'Expedientes Actualizados',
          areaId: subAreaRRHH.id,
          puestoId: puestoAsistenteRRHH.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Expedientes completos / Total de expedientes activos) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-ASI-003',
          indicador: 'Cumplimiento de Solicitudes de RRHH',
          areaId: subAreaRRHH.id,
          puestoId: puestoAsistenteRRHH.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: '# solicitudes atendidas según requerimiento',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-ASI-004',
          indicador: 'Cumplimiento de Solicitudes de Gerencia',
          areaId: subAreaRRHH.id,
          puestoId: puestoAsistenteRRHH.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: '# solicitudes atendidas según requerimiento',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisAsistenteRRHH) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Encargada de Limpieza
    const puestoLimpieza = await prisma.puesto.findFirst({
      where: { nombre: 'Encargada de Limpieza', areaId: subAreaRRHH.id },
    });

    if (puestoLimpieza) {
      const kpisLimpieza = [
        {
          key: 'RRHH-LIM-001',
          indicador: 'Cumplimiento de limpieza',
          areaId: subAreaRRHH.id,
          puestoId: puestoLimpieza.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Auditoria de limpieza',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-LIM-002',
          indicador: 'Quejas por limpieza',
          areaId: subAreaRRHH.id,
          puestoId: puestoLimpieza.id,
          tipoCalculo: 'conteo',
          formulaCalculo: JSON.stringify({
            descripcion: 'Nº de quejas formales',
          }),
          meta: 0,
          unidad: 'quejas',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisLimpieza) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Encargado de Reclutamiento
    const puestoReclutamiento = await prisma.puesto.findFirst({
      where: { nombre: 'Encargado de Reclutamiento', areaId: subAreaRRHH.id },
    });

    if (puestoReclutamiento) {
      const kpisReclutamiento = [
        {
          key: 'RRHH-REC-001',
          indicador: 'Tiempo de cobertura de vacantes',
          areaId: subAreaRRHH.id,
          puestoId: puestoReclutamiento.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Vacantes cubiertas dentro del plazo definido / Vacantes totales) × 100',
          }),
          meta: 3,
          unidad: 'días',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-REC-002',
          indicador: 'Cumplimiento del procedimiento de reclutamiento',
          areaId: subAreaRRHH.id,
          puestoId: puestoReclutamiento.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Contrataciones conforme a procedimiento aprobado / Total contrataciones) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-REC-003',
          indicador: 'Calidad mínima de contratación',
          areaId: subAreaRRHH.id,
          puestoId: puestoReclutamiento.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Contrataciones que superan período de prueba / Total contrataciones) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-REC-004',
          indicador: 'Dashboard Semanal',
          areaId: subAreaRRHH.id,
          puestoId: puestoReclutamiento.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Presentación de dashboard al 100% de plazas',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-REC-005',
          indicador: 'Base activa de candidatos',
          areaId: subAreaRRHH.id,
          puestoId: puestoReclutamiento.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Candidatos calificados activos / Objetivo definido) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'trimestral',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisReclutamiento) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Generalista de Recursos Humanos
    const puestoGeneralista = await prisma.puesto.findFirst({
      where: {
        nombre: 'Generalista de Recursos Humanos',
        areaId: subAreaRRHH.id,
      },
    });

    if (puestoGeneralista) {
      const kpisGeneralista = [
        {
          key: 'RRHH-GEN-001',
          indicador: 'Procesos disciplinarios gestionados en plazo',
          areaId: subAreaRRHH.id,
          puestoId: puestoGeneralista.id,
          tipoCalculo: 'tiempo',
          formulaCalculo: JSON.stringify({
            descripcion: '# de acciones disciplinarias con proceso documentado',
          }),
          meta: 10,
          unidad: 'días',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GEN-002',
          indicador: 'Entrega oportuna y exacta de nómina',
          areaId: subAreaRRHH.id,
          puestoId: puestoGeneralista.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Nóminas entregadas en fecha y sin reclamos / Nóminas procesadas) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GEN-003',
          indicador: 'Gestión ordenada de contrataciones en proyectos',
          areaId: subAreaRRHH.id,
          puestoId: puestoGeneralista.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Contrataciones de proyecto con expediente completo y contrato vigente / Total contrataciones de proyecto) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GEN-004',
          indicador: 'Cumplimiento legal laboral',
          areaId: subAreaRRHH.id,
          puestoId: puestoGeneralista.id,
          tipoCalculo: 'conteo',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Nº de incidentes legales laborales atribuibles a RRHH',
          }),
          meta: 0,
          unidad: 'incidentes',
          periodicidad: 'trimestral',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GEN-005',
          indicador: 'Expedientes completos',
          areaId: subAreaRRHH.id,
          puestoId: puestoGeneralista.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '# de Colaboradores con expedientes completos / Total de colaboradores laborando X 100',
          }),
          meta: 95,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GEN-006',
          indicador: 'Inscripciones y pagos',
          areaId: subAreaRRHH.id,
          puestoId: puestoGeneralista.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '# de Colaboradores inscritos/Total de colaboradores laborando X 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GEN-007',
          indicador: 'Pólizas de seguros vigentes',
          areaId: subAreaRRHH.id,
          puestoId: puestoGeneralista.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Pólizas vigentes y correctamente actualizadas / Total pólizas requeridas) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisGeneralista) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    // PUESTO: Gestor de Recursos Humanos
    const puestoGestor = await prisma.puesto.findFirst({
      where: { nombre: 'Gestor de Recursos Humanos', areaId: subAreaRRHH.id },
    });

    if (puestoGestor) {
      const kpisGestor = [
        {
          key: 'RRHH-GES-001',
          indicador: 'Ejecución del plan de cultura organizacional',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Avances en el alineamiento de la cultura organizacional',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GES-002',
          indicador: 'Medición de la gestión de desarrollo y crecimiento',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Colaboradores con plan de desarrollo activo / Colaboradores clave definidos) × 100',
          }),
          meta: 90,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GES-003',
          indicador: 'Gestión del desempeño basada en KPIs',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Colaboradores con gestión de desempeño / Total colaboradores) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GES-004',
          indicador: 'Clima organizacional',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Encuesta de Clima laboral',
          }),
          meta: 83,
          unidad: '%',
          periodicidad: 'semestral',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GES-005',
          indicador: 'Alineamiento preventivo a la cultura organizacional',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              '(Casos de desviación cultural gestionados preventivamente / Casos detectados) × 100',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GES-006',
          indicador: 'Colaboradores integrados exitosamente',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'conteo',
          formulaCalculo: JSON.stringify({
            descripcion: '# Colaboradores integrados',
          }),
          meta: 6,
          unidad: 'meses',
          periodicidad: 'mensual',
          sentido: 'Menor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GES-007',
          indicador: 'Auditoría de proceso de Integración por colaborador',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'formula',
          formulaCalculo: JSON.stringify({
            descripcion:
              'Auditoría del proceso de integración por colaborador/ total de colaboradores contratados',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GES-008',
          indicador: 'Cumplimiento del Plan de Capacitación',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'Cumplimiento del plan de capacitación',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
        {
          key: 'RRHH-GES-009',
          indicador: 'Cumplimiento de KPIs del equipo',
          areaId: subAreaRRHH.id,
          puestoId: puestoGestor.id,
          tipoCalculo: 'porcentaje',
          formulaCalculo: JSON.stringify({
            descripcion: 'KPIs del equipo contable= verde',
          }),
          meta: 100,
          unidad: '%',
          periodicidad: 'mensual',
          sentido: 'Mayor es mejor',
          activo: true,
        },
      ];

      for (const kpi of kpisGestor) {
        const existente = await prisma.kPI.findUnique({
          where: { key: kpi.key },
        });
        if (!existente) {
          await prisma.kPI.create({ data: kpi });
          console.log(`  ✅ KPI ${kpi.key} creado`);
        } else {
          console.log(`  ⏭️  KPI ${kpi.key} ya existe`);
        }
      }
    }

    console.log(`✅ KPIs de Recursos Humanos completados\n`);
  }

  console.log('🎉 Seed de KPIs Administrativos completado!\n');
  await prisma.$disconnect();
}

seedKPIsAdministrativos().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});
