/**
 * Borra las evaluaciones de un periodo (para re-cerrarlo desde cero).
 * EvaluacionDetalle se borra en cascada; Alerta.evaluacionId queda en null.
 *
 *   npx ts-node -r tsconfig-paths/register scripts/borrar-evaluaciones-periodo.ts abril 2026
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [, , periodo, anioStr] = process.argv;
  if (!periodo || !anioStr) {
    console.error('Uso: borrar-evaluaciones-periodo.ts <periodo> <anio>');
    process.exit(1);
  }
  const anio = parseInt(anioStr, 10);

  const evals = await prisma.evaluacion.findMany({
    where: { periodo, anio },
    select: { id: true },
  });
  if (evals.length === 0) {
    console.log(`No hay evaluaciones para ${periodo} ${anio}.`);
    return;
  }

  const ids = evals.map((e) => e.id);
  const detalles = await prisma.evaluacionDetalle.count({
    where: { evaluacionId: { in: ids } },
  });

  const res = await prisma.evaluacion.deleteMany({ where: { periodo, anio } });
  console.log(
    `Borradas ${res.count} evaluaciones de ${periodo} ${anio} (+${detalles} detalles en cascada).`,
  );
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
