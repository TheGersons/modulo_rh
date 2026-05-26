import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const activos = await prisma.user.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true, areaId: true, puestoId: true },
  });
  const evals = await prisma.evaluacion.findMany({
    where: { periodo: 'abril', anio: 2026 },
    select: { empleadoId: true },
  });
  const evaluados = new Set(evals.map((e) => e.empleadoId));

  const sinEval = activos.filter((u) => !evaluados.has(u.id));
  console.log(`Activos SIN evaluación: ${sinEval.length}\n`);

  for (const u of sinEval) {
    // ¿cuántos KPIs asignados (área+puesto) y de qué periodicidad?
    let kpisMensual = 0;
    let kpisTotal = 0;
    if (u.areaId) {
      const or: any[] = [{ areaId: u.areaId, puestoId: null }];
      if (u.puestoId) or.push({ areaId: u.areaId, puestoId: u.puestoId });
      const kpis = await prisma.kPI.findMany({
        where: { OR: or, activo: true },
        select: { periodicidad: true },
      });
      kpisTotal = kpis.length;
      kpisMensual = kpis.filter((k) => k.periodicidad === 'mensual').length;
    }
    // ¿subió evidencia en 2026-04?
    const evid = await prisma.evidenciaKPI.count({
      where: { empleadoId: u.id, periodo: '2026-04', tipo: { not: 'nota_kpi' } },
    });
    console.log(
      `- ${u.nombre} ${u.apellido}` +
      `  area=${u.areaId ? 'sí' : 'NO'} puesto=${u.puestoId ? 'sí' : 'no'}` +
      `  kpis(total/mensual)=${kpisTotal}/${kpisMensual}  evidenciasAbril=${evid}`,
    );
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
