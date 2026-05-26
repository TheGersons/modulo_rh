/**
 * Diagnóstico del cron de cierre:
 *  - ¿Se crearon evaluaciones para los periodos esperados?
 *  - ¿En qué status quedaron?
 *  - ¿Cuándo se crearon (vs. cuándo el cron debió correr)?
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const todas = await prisma.evaluacion.findMany({
    select: {
      periodo: true, anio: true, status: true,
      fechaCalculo: true, fechaCierre: true, createdAt: true,
      calculadaAutomaticamente: true,
    },
  });

  console.log(`Total evaluaciones en BD: ${todas.length}\n`);

  // Agrupar por (anio, periodo)
  const grupos = new Map<string, typeof todas>();
  for (const e of todas) {
    const k = `${e.anio} | ${e.periodo}`;
    if (!grupos.has(k)) grupos.set(k, [] as any);
    grupos.get(k)!.push(e);
  }

  const keys = [...grupos.keys()].sort();
  for (const k of keys) {
    const list = grupos.get(k)!;
    const statuses: Record<string, number> = {};
    for (const e of list) statuses[e.status] = (statuses[e.status] ?? 0) + 1;
    const creadas = list.map((e) => e.createdAt).sort((a, b) => a.getTime() - b.getTime());
    const calculadas = list.map((e) => e.fechaCalculo).filter(Boolean) as Date[];
    const cerradas = list.map((e) => e.fechaCierre).filter(Boolean) as Date[];

    console.log(`Periodo "${k}": ${list.length} evals  ${JSON.stringify(statuses)}`);
    console.log(`  Primera creada : ${creadas[0]?.toISOString()}`);
    console.log(`  Última creada  : ${creadas.at(-1)?.toISOString()}`);
    if (calculadas.length) {
      const min = new Date(Math.min(...calculadas.map((d) => d.getTime())));
      console.log(`  Primer fechaCalculo: ${min.toISOString()}  (${calculadas.length} con fechaCalculo)`);
    }
    if (cerradas.length) {
      const min = new Date(Math.min(...cerradas.map((d) => d.getTime())));
      console.log(`  Primer fechaCierre : ${min.toISOString()}  (${cerradas.length} con fechaCierre)`);
    }
    console.log('');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
