/**
 * ¿Quién debió ser evaluado en abril 2026 y quién quedó fuera?
 *
 * Compara:
 *   A) Empleados activos
 *   B) Empleados que subieron EvidenciaKPI (período "2026-04")
 *   C) Empleados con órdenes completadas/aprobadas en abril
 *   D) Empleados que efectivamente tienen Evaluacion (periodo "abril" 2026)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERIODO_KPI = '2026-04';   // formato EvidenciaKPI
const PERIODO_EVAL = 'abril';    // formato Evaluacion / cierre
const ANIO = 2026;

function nombre(u: { nombre: string; apellido: string }) {
  return `${u.nombre} ${u.apellido}`;
}

async function main() {
  // A) activos
  const activos = await prisma.user.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true },
  });
  const activosMap = new Map(activos.map((u) => [u.id, u]));

  // B) subieron EvidenciaKPI (excluye notas)
  const evid = await prisma.evidenciaKPI.findMany({
    where: { periodo: PERIODO_KPI, tipo: { not: 'nota_kpi' } },
    select: { empleadoId: true, status: true, valorNumerico: true, kpiId: true },
  });
  const subieronKpi = new Set(evid.map((e) => e.empleadoId));

  // C) órdenes completadas/aprobadas con fechaCompletada en abril
  const inicio = new Date(2026, 3, 1, 0, 0, 0);
  const fin = new Date(2026, 3, 30, 23, 59, 59, 999);
  const ordenes = await prisma.ordenTrabajo.findMany({
    where: {
      status: { in: ['completada', 'aprobada'] },
      fechaCompletada: { gte: inicio, lte: fin },
    },
    select: { empleadoId: true },
  });
  const conOrdenes = new Set(ordenes.map((o) => o.empleadoId));

  // D) evaluados
  const evals = await prisma.evaluacion.findMany({
    where: { periodo: PERIODO_EVAL, anio: ANIO },
    select: { empleadoId: true },
  });
  const evaluados = new Set(evals.map((e) => e.empleadoId));

  console.log('═══════════════════════════════════════════════════');
  console.log(`  Diagnóstico evaluaciones — abril 2026`);
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Empleados activos                    : ${activos.length}`);
  console.log(`  Subieron EvidenciaKPI (2026-04)      : ${subieronKpi.size}`);
  console.log(`  Con órdenes completadas/aprob. abril : ${conOrdenes.size}`);
  console.log(`  Con Evaluacion creada                : ${evaluados.size}`);
  console.log('');

  // Subieron KPI pero NO fueron evaluados
  const subieronNoEvaluados = [...subieronKpi].filter((id) => !evaluados.has(id));
  console.log(`  ⚠ Subieron KPI pero NO evaluados: ${subieronNoEvaluados.length}`);
  for (const id of subieronNoEvaluados) {
    const u = activosMap.get(id);
    const tieneOrden = conOrdenes.has(id);
    console.log(`     - ${u ? nombre(u) : id}   ${tieneOrden ? '(tiene órdenes)' : '(sin órdenes — KPI por evidencia)'}`);
  }
  console.log('');

  // Activos sin ninguna actividad ni evaluación (deberían ir en 0/rojo según el usuario)
  const activosSinEval = activos.filter((u) => !evaluados.has(u.id));
  console.log(`  Activos sin Evaluacion (total): ${activosSinEval.length}`);
  console.log('');

  // Tipos de KPI involucrados en las evidencias subidas
  const kpiIds = [...new Set(evid.map((e) => e.kpiId))];
  const kpis = await prisma.kPI.findMany({
    where: { id: { in: kpiIds } },
    select: { id: true, indicador: true, tipoCalculo: true, aplicaOrdenTrabajo: true, periodicidad: true },
  });
  console.log('  KPIs con evidencias subidas en 2026-04:');
  for (const k of kpis) {
    const n = evid.filter((e) => e.kpiId === k.id).length;
    console.log(`     - ${k.indicador}  [calc=${k.tipoCalculo}, OT=${k.aplicaOrdenTrabajo}, per=${k.periodicidad}]  ${n} evid`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
