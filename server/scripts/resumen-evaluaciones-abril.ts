import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const evals = await prisma.evaluacion.findMany({
    where: { periodo: 'abril', anio: 2026 },
    select: { id: true, promedioGeneral: true, kpisRojos: true, status: true },
  });
  console.log(`Evaluaciones abril 2026: ${evals.length}`);
  const statuses: Record<string, number> = {};
  for (const e of evals) statuses[e.status] = (statuses[e.status] ?? 0) + 1;
  console.log('Status:', JSON.stringify(statuses));

  const proms = evals.map((e) => e.promedioGeneral ?? 0);
  const promAvg = proms.reduce((a, b) => a + b, 0) / (proms.length || 1);
  console.log(`Promedio general (media): ${promAvg.toFixed(1)}`);
  console.log(`Evaluaciones con promedio 0: ${proms.filter((p) => p === 0).length}`);
  console.log(`Evaluaciones con promedio 100: ${proms.filter((p) => p === 100).length}`);
  console.log('');

  const detalles = await prisma.evaluacionDetalle.findMany({
    where: { evaluacion: { periodo: 'abril', anio: 2026 } },
    select: { estado: true, formulaUtilizada: true },
  });
  console.log(`Total EvaluacionDetalle: ${detalles.length}`);
  const porEstado: Record<string, number> = {};
  for (const d of detalles) porEstado[d.estado ?? 'null'] = (porEstado[d.estado ?? 'null'] ?? 0) + 1;
  console.log('Por estado:', JSON.stringify(porEstado));

  // Motivos (sin_evidencia / sin_ordenes) entre los rojos
  const motivos: Record<string, number> = {};
  for (const d of detalles) {
    try {
      const f = JSON.parse(d.formulaUtilizada ?? '{}');
      if (f.motivo) motivos[f.motivo] = (motivos[f.motivo] ?? 0) + 1;
    } catch { /* ignore */ }
  }
  console.log('Motivos (detalles sin dato):', JSON.stringify(motivos));
}

main().catch(console.error).finally(() => prisma.$disconnect());
