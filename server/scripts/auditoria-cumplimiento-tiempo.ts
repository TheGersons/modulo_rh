/**
 * Auditoría consolidada de cumplimiento de tiempo:
 *
 *   1. Cierres de período   → ¿se cerró cada Evaluacion el día esperado
 *                              (último día del periodo + DIAS_GRACIA + 1)?
 *   2. Órdenes de trabajo   → ¿se completaron / aprobaron antes de fechaLimite?
 *   3. Evidencias KPI       → ¿se subieron dentro de la ventana
 *                              (fin del periodo + DIAS_GRACIA)?
 *
 * Solo lectura. Imprime un reporte; no modifica datos.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const TOLERANCIA_CIERRE_HORAS = 24; // cron corre a las 23:50; permitimos hasta +24h

function ultimoDiaMes(anio: number, mes0: number): Date {
  return new Date(anio, mes0 + 1, 0, 23, 59, 59, 999);
}

/**
 * Devuelve la fecha esperada de cierre (cuando debió correr el cron)
 * para una evaluación dada, o null si el formato del periodo no se reconoce.
 *
 * El cron corre a las 23:50 del día (DIAS_GRACIA + 1) del mes siguiente al
 * fin del periodo.
 */
function fechaEsperadaCierre(
  periodo: string,
  anio: number,
  diasGracia: number,
): { esperada: Date; finPeriodo: Date } | null {
  let finPeriodo: Date | null = null;

  // mensual: "enero".."diciembre"
  const mesIdx = MESES.indexOf(periodo);
  if (mesIdx >= 0) {
    finPeriodo = ultimoDiaMes(anio, mesIdx);
  } else if (/^trimestre_[1-4]$/.test(periodo)) {
    const t = parseInt(periodo.split('_')[1], 10);
    finPeriodo = ultimoDiaMes(anio, t * 3 - 1); // Q1→marzo(2), Q2→jun(5)...
  } else if (/^semestre_[12]$/.test(periodo)) {
    const s = parseInt(periodo.split('_')[1], 10);
    finPeriodo = ultimoDiaMes(anio, s === 1 ? 5 : 11);
  } else if (periodo === 'anual') {
    finPeriodo = ultimoDiaMes(anio, 11);
  }

  if (!finPeriodo) return null;

  // Día (DIAS_GRACIA + 1) del mes siguiente, 23:50
  const mesSiguiente = new Date(
    finPeriodo.getFullYear(),
    finPeriodo.getMonth() + 1,
    diasGracia + 1,
    23, 50, 0, 0,
  );
  return { esperada: mesSiguiente, finPeriodo };
}

function fmt(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 16).replace('T', ' ') : '—';
}

function pct(num: number, denom: number): string {
  if (denom === 0) return '—';
  return ((num / denom) * 100).toFixed(1) + '%';
}

async function getDiasGracia(): Promise<number> {
  const row = await prisma.configuracion.findUnique({
    where: { clave: 'dias_gracia_kpi' },
  });
  const n = Number(row?.valor ?? 5);
  return Number.isFinite(n) ? n : 5;
}

// ───────────────────────────────────────────────────────────────────────────
// 1. Cierres de período
// ───────────────────────────────────────────────────────────────────────────
async function auditarCierres(diasGracia: number) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  1. CIERRES DE PERÍODO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  DIAS_GRACIA = ${diasGracia}  →  cron espera correr el día ${diasGracia + 1} 23:50`);
  console.log('');

  const evaluaciones = await prisma.evaluacion.findMany({
    where: { status: 'cerrada', fechaCierre: { not: null } },
    select: { id: true, periodo: true, anio: true, fechaCierre: true, tipoPeriodo: true },
  });

  if (evaluaciones.length === 0) {
    console.log('  (sin evaluaciones cerradas todavía)\n');
    return;
  }

  // Agrupamos por (periodo, anio) — todas las evals del mismo cierre comparten fechaCierre.
  type Grupo = {
    periodo: string; anio: number; tipoPeriodo: string | null;
    fechasCierre: Date[]; cantidad: number;
  };
  const grupos = new Map<string, Grupo>();
  for (const e of evaluaciones) {
    const key = `${e.anio}|${e.periodo}`;
    const g = grupos.get(key) ?? {
      periodo: e.periodo, anio: e.anio, tipoPeriodo: e.tipoPeriodo,
      fechasCierre: [], cantidad: 0,
    };
    if (e.fechaCierre) g.fechasCierre.push(e.fechaCierre);
    g.cantidad += 1;
    grupos.set(key, g);
  }

  const filas = [...grupos.values()]
    .map((g) => {
      const minCierre = new Date(Math.min(...g.fechasCierre.map((d) => d.getTime())));
      const esperado = fechaEsperadaCierre(g.periodo, g.anio, diasGracia);
      return { ...g, minCierre, esperado };
    })
    .sort((a, b) => a.minCierre.getTime() - b.minCierre.getTime());

  console.log(
    '  '.padEnd(2) +
    'PERIODO'.padEnd(16) +
    'AÑO  '.padEnd(6) +
    'EVALS'.padEnd(7) +
    'CIERRE REAL      '.padEnd(20) +
    'CIERRE ESPERADO  '.padEnd(20) +
    'Δ (h)'.padStart(8) +
    '  RESULT'
  );

  let aTiempo = 0;
  let tardes = 0;
  let desconocidos = 0;

  for (const f of filas) {
    let deltaH = '—'.padStart(7);
    let resultado = 'desconocido';

    if (f.esperado) {
      const diffMs = f.minCierre.getTime() - f.esperado.esperada.getTime();
      const h = diffMs / 3_600_000;
      deltaH = h.toFixed(1).padStart(7);
      if (h <= TOLERANCIA_CIERRE_HORAS) {
        resultado = '✓ a tiempo';
        aTiempo += 1;
      } else {
        resultado = '⚠ tarde';
        tardes += 1;
      }
    } else {
      desconocidos += 1;
    }

    console.log(
      '  ' +
      f.periodo.padEnd(16) +
      String(f.anio).padEnd(6) +
      String(f.cantidad).padEnd(7) +
      fmt(f.minCierre).padEnd(20) +
      fmt(f.esperado?.esperada).padEnd(20) +
      deltaH + '  ' +
      resultado,
    );
  }

  console.log('');
  console.log(`  → A tiempo: ${aTiempo}   Tarde: ${tardes}   Sin referencia: ${desconocidos}`);
  console.log('');
}

// ───────────────────────────────────────────────────────────────────────────
// 2. Órdenes de trabajo vs fechaLimite
// ───────────────────────────────────────────────────────────────────────────
async function auditarOrdenes() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  2. ÓRDENES DE TRABAJO vs fechaLimite');
  console.log('═══════════════════════════════════════════════════════════');

  const ordenes = await prisma.ordenTrabajo.findMany({
    where: { status: { not: 'cancelada' } },
    select: {
      id: true, status: true, titulo: true,
      fechaLimite: true, fechaCompletada: true,
      empleado: { select: { nombre: true, apellido: true } },
    },
  });

  if (ordenes.length === 0) {
    console.log('  (sin órdenes registradas)\n');
    return;
  }

  const ahora = new Date();
  let finalizadasATiempo = 0;
  let finalizadasTarde = 0;
  let abiertasDentroPlazo = 0;
  let abiertasVencidas = 0;
  let sinFechaCompletada = 0; // status final sin fechaCompletada

  const tardes: Array<{
    titulo: string; status: string; fechaLimite: Date;
    fechaCompletada: Date | null; horasAtraso: number; empleado: string;
  }> = [];

  for (const o of ordenes) {
    const empleado = `${o.empleado.nombre} ${o.empleado.apellido}`;
    const esFinal = o.status === 'completada' || o.status === 'aprobada';

    if (esFinal) {
      if (!o.fechaCompletada) {
        sinFechaCompletada += 1;
        continue;
      }
      const aTiempo = o.fechaCompletada.getTime() <= o.fechaLimite.getTime();
      if (aTiempo) {
        finalizadasATiempo += 1;
      } else {
        finalizadasTarde += 1;
        const horasAtraso =
          (o.fechaCompletada.getTime() - o.fechaLimite.getTime()) / 3_600_000;
        tardes.push({
          titulo: o.titulo, status: o.status, fechaLimite: o.fechaLimite,
          fechaCompletada: o.fechaCompletada, horasAtraso, empleado,
        });
      }
    } else {
      // sigue abierta (pendiente, en_proceso, en_pausa, rechazada, vencida)
      if (o.fechaLimite.getTime() < ahora.getTime()) {
        abiertasVencidas += 1;
      } else {
        abiertasDentroPlazo += 1;
      }
    }
  }

  const totalFinales = finalizadasATiempo + finalizadasTarde;
  console.log(`  Total órdenes (sin canceladas): ${ordenes.length}`);
  console.log('');
  console.log(`  Finalizadas (completada/aprobada): ${totalFinales}`);
  console.log(`    ✓ A tiempo : ${finalizadasATiempo}  (${pct(finalizadasATiempo, totalFinales)})`);
  console.log(`    ⚠ Tarde    : ${finalizadasTarde}  (${pct(finalizadasTarde, totalFinales)})`);
  if (sinFechaCompletada > 0) {
    console.log(`    ⚠ Sin fechaCompletada (data sucia): ${sinFechaCompletada}`);
  }
  console.log('');
  console.log(`  Abiertas: ${abiertasDentroPlazo + abiertasVencidas}`);
  console.log(`    Dentro de plazo: ${abiertasDentroPlazo}`);
  console.log(`    Vencidas       : ${abiertasVencidas}`);
  console.log('');

  if (tardes.length > 0) {
    tardes.sort((a, b) => b.horasAtraso - a.horasAtraso);
    console.log(`  Top 10 órdenes finalizadas más tarde:`);
    for (const t of tardes.slice(0, 10)) {
      const titulo = (t.titulo.length > 38 ? t.titulo.slice(0, 35) + '...' : t.titulo).padEnd(40);
      console.log(
        `    ${titulo}` +
        `límite ${fmt(t.fechaLimite)}  ` +
        `cerrada ${fmt(t.fechaCompletada)}  ` +
        `+${t.horasAtraso.toFixed(1)}h  (${t.empleado})`,
      );
    }
    console.log('');
  }
}

// ───────────────────────────────────────────────────────────────────────────
// 3. Evidencias KPI vs ventana (fin de periodo + DIAS_GRACIA)
// ───────────────────────────────────────────────────────────────────────────
async function auditarEvidencias(diasGracia: number) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  3. EVIDENCIAS KPI dentro de la ventana');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Ventana = último día del periodo + ${diasGracia} días`);
  console.log('');

  const evidencias = await prisma.evidenciaKPI.findMany({
    where: { tipo: { not: 'nota_kpi' } },
    select: {
      id: true, periodo: true, fechaSubida: true,
      esFueraDeTiempo: true, esRespaldoGracia: true, status: true,
    },
  });

  if (evidencias.length === 0) {
    console.log('  (sin evidencias)\n');
    return;
  }

  type PeriodoStat = {
    total: number; enPeriodo: number; enGracia: number; fueraVentana: number;
    flagFueraDeTiempo: number; conflictos: number;
  };
  const porPeriodo = new Map<string, PeriodoStat>();

  let totalEnPeriodo = 0;
  let totalEnGracia = 0;
  let totalFueraVentana = 0;
  let totalConflictoFlag = 0;

  for (const e of evidencias) {
    // periodo formato "YYYY-MM"
    const m = /^(\d{4})-(\d{2})$/.exec(e.periodo);
    if (!m) continue;
    const anio = parseInt(m[1], 10);
    const mes0 = parseInt(m[2], 10) - 1;
    const finMes = ultimoDiaMes(anio, mes0);
    const finVentana = new Date(finMes);
    finVentana.setDate(finVentana.getDate() + diasGracia);

    const subida = e.fechaSubida;
    const stat = porPeriodo.get(e.periodo) ?? {
      total: 0, enPeriodo: 0, enGracia: 0, fueraVentana: 0,
      flagFueraDeTiempo: 0, conflictos: 0,
    };
    stat.total += 1;

    let realFueraVentana = false;
    if (subida <= finMes) {
      stat.enPeriodo += 1;
      totalEnPeriodo += 1;
    } else if (subida <= finVentana) {
      stat.enGracia += 1;
      totalEnGracia += 1;
    } else {
      stat.fueraVentana += 1;
      totalFueraVentana += 1;
      realFueraVentana = true;
    }

    if (e.esFueraDeTiempo) stat.flagFueraDeTiempo += 1;
    if (e.esFueraDeTiempo !== realFueraVentana) {
      stat.conflictos += 1;
      totalConflictoFlag += 1;
    }

    porPeriodo.set(e.periodo, stat);
  }

  console.log(`  Total evidencias KPI: ${evidencias.length}`);
  console.log(`    Subidas dentro del período          : ${totalEnPeriodo}  (${pct(totalEnPeriodo, evidencias.length)})`);
  console.log(`    Subidas en gracia (post-período)    : ${totalEnGracia}  (${pct(totalEnGracia, evidencias.length)})`);
  console.log(`    Subidas FUERA de la ventana         : ${totalFueraVentana}  (${pct(totalFueraVentana, evidencias.length)})`);
  console.log('');
  if (totalConflictoFlag > 0) {
    console.log(`  ⚠ Discrepancias entre esFueraDeTiempo (flag persistido) y la ventana real: ${totalConflictoFlag}`);
    console.log('');
  }

  console.log('  Desglose por periodo:');
  console.log(
    '    ' +
    'PERIODO'.padEnd(10) +
    'TOTAL'.padEnd(8) +
    'EN PER'.padEnd(8) +
    'GRACIA'.padEnd(8) +
    'FUERA'.padEnd(8) +
    'FLAG'.padEnd(8) +
    'CONFLICTO',
  );
  const claves = [...porPeriodo.keys()].sort();
  for (const k of claves) {
    const s = porPeriodo.get(k)!;
    console.log(
      '    ' +
      k.padEnd(10) +
      String(s.total).padEnd(8) +
      String(s.enPeriodo).padEnd(8) +
      String(s.enGracia).padEnd(8) +
      String(s.fueraVentana).padEnd(8) +
      String(s.flagFueraDeTiempo).padEnd(8) +
      (s.conflictos > 0 ? String(s.conflictos) : '—'),
    );
  }
  console.log('');
}

async function main() {
  console.log('');
  console.log(`Auditoría de cumplimiento de tiempo  —  ${new Date().toISOString()}`);
  console.log('');

  const diasGracia = await getDiasGracia();

  await auditarCierres(diasGracia);
  await auditarOrdenes();
  await auditarEvidencias(diasGracia);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Fin del reporte');
  console.log('═══════════════════════════════════════════════════════════');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
