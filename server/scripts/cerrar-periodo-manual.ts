/**
 * Cierre manual de un periodo (rescate cuando el cron no corrió).
 *
 * Bootea el contexto de Nest (sin servidor HTTP) y llama
 * EvaluacionesService.cerrarPeriodoAuto, igual que el cron.
 *
 *   PERIODICIDAD: "mensual" | "trimestral" | "semestral" | "anual"
 *   PERIODO:      "enero".."diciembre" | "trimestre_1..4" | "semestre_1..2" | "anual"
 *   ANIO:         number
 *
 * Uso:
 *   npx ts-node -r tsconfig-paths/register scripts/cerrar-periodo-manual.ts mensual abril 2026
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { EvaluacionesService } from '../src/modules/evaluaciones/evaluaciones.service';

async function main() {
  const [, , periodicidad, periodo, anioStr] = process.argv;

  if (!periodicidad || !periodo || !anioStr) {
    console.error('Uso: cerrar-periodo-manual.ts <periodicidad> <periodo> <anio>');
    console.error('  Ej: cerrar-periodo-manual.ts mensual abril 2026');
    process.exit(1);
  }

  const anio = parseInt(anioStr, 10);
  if (!Number.isFinite(anio)) {
    console.error('anio inválido:', anioStr);
    process.exit(1);
  }

  console.log(`▶ Cerrando ${periodicidad} ${periodo} ${anio}...`);
  console.log('');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const svc = app.get(EvaluacionesService);

    const yaCerrado = await svc.existeAlgunaEvaluacion(periodo, anio);
    if (yaCerrado) {
      console.log(`⏭️  Ya existen evaluaciones para ${periodo} ${anio}. No se hizo nada.`);
      return;
    }

    const r = await svc.cerrarPeriodoAuto(periodicidad, periodo, anio);
    console.log('');
    console.log(`✓ ${r.mensaje}`);
    console.log(`  Evaluaciones creadas: ${r.evaluacionesCreadas}`);
  } finally {
    await app.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
