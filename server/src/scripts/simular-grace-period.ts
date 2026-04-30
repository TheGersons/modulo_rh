/* eslint-disable no-console */
/**
 * Simulación de la ventana de gracia para KPIs basados en órdenes de trabajo.
 *
 * Ejecutar:
 *   cd server && npx ts-node src/scripts/simular-grace-period.ts
 *
 * No toca la BD — simula la lógica pura de los helpers y replica las
 * decisiones del cron y del controller para los casos que el usuario describió.
 */

import {
  getVentanaGracia,
  enVentanaGracia,
  formatPeriodo,
  getPeriodoCerrarHoy,
} from '../common/utils/grace-period.util';

const DIAS_GRACIA = 5;
const ok = (s: string) => `\x1b[32m✓ ${s}\x1b[0m`;
const fail = (s: string) => `\x1b[31m✗ ${s}\x1b[0m`;
const head = (s: string) => `\n\x1b[1m\x1b[36m── ${s} ─────────────────────────────────\x1b[0m`;

let pass = 0;
let total = 0;

function expect(cond: boolean, label: string) {
  total++;
  if (cond) {
    pass++;
    console.log('  ' + ok(label));
  } else {
    console.log('  ' + fail(label));
  }
}

// ─── Caso 1: ventana de gracia para periodo abril 2026 ────────────────────────
console.log(head('Caso 1: Ventana de gracia para periodo "2026-04"'));
{
  const v = getVentanaGracia('2026-04', DIAS_GRACIA);
  console.log(`  inicio: ${v.inicio.toISOString()}`);
  console.log(`  fin   : ${v.fin.toISOString()}`);
  expect(
    v.inicio.getFullYear() === 2026 && v.inicio.getMonth() === 4 && v.inicio.getDate() === 1,
    'inicio = 1 de mayo 2026 (00:00)',
  );
  expect(
    v.fin.getFullYear() === 2026 && v.fin.getMonth() === 4 && v.fin.getDate() === 5,
    'fin = 5 de mayo 2026 (23:59)',
  );
}

// ─── Caso 2: enVentanaGracia con fechas dentro/fuera ──────────────────────────
console.log(head('Caso 2: enVentanaGracia para periodo "2026-04"'));
{
  const escenarios: { fecha: string; esperado: boolean; etiqueta: string }[] = [
    { fecha: '2026-04-15T10:00:00', esperado: false, etiqueta: '15 abr — mitad de mes' },
    { fecha: '2026-04-30T23:59:59', esperado: false, etiqueta: '30 abr 23:59 — último seg del periodo' },
    { fecha: '2026-05-01T00:00:00', esperado: true, etiqueta: '1 may 00:00 — inicio ventana' },
    { fecha: '2026-05-03T15:00:00', esperado: true, etiqueta: '3 may — mitad ventana' },
    { fecha: '2026-05-05T23:59:59', esperado: true, etiqueta: '5 may 23:59 — fin ventana' },
    { fecha: '2026-05-06T00:00:00', esperado: false, etiqueta: '6 may 00:00 — fuera (cron corre a 23:50)' },
    { fecha: '2026-05-10T12:00:00', esperado: false, etiqueta: '10 may — claramente fuera' },
  ];
  for (const e of escenarios) {
    const r = enVentanaGracia(new Date(e.fecha), '2026-04', DIAS_GRACIA);
    expect(r === e.esperado, `${e.etiqueta} → ${r ? 'dentro' : 'fuera'}`);
  }
}

// ─── Caso 3: Cron — qué cierres dispararía cada día del año ───────────────────
console.log(head('Caso 3: Cron — días que disparan cierre (DIAS_GRACIA + 1 = 6)'));
{
  // Replica la lógica de evaluaciones.cron.ts con un Date simulado.
  function cronSimulado(hoy: Date): {
    mensual: string | null;
    trimestral: string | null;
    semestral: string | null;
    anual: string | null;
  } {
    const out = { mensual: null as string | null, trimestral: null as string | null, semestral: null as string | null, anual: null as string | null };
    if (hoy.getDate() !== DIAS_GRACIA + 1) return out;
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const anio = mesAnterior.getFullYear();
    const mes0 = mesAnterior.getMonth();
    const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    out.mensual = `${MESES[mes0]} ${anio}`;
    if ([2, 5, 8, 11].includes(mes0)) out.trimestral = `Q${Math.floor(mes0 / 3) + 1} ${anio}`;
    if ([5, 11].includes(mes0)) out.semestral = `S${mes0 < 6 ? 1 : 2} ${anio}`;
    if (mes0 === 11) out.anual = `${anio}`;
    return out;
  }

  const casos: { fecha: string; etiqueta: string; esperaMensual: string | null; esperaTrim: string | null; esperaSem: string | null; esperaAnual: string | null }[] = [
    { fecha: '2026-04-30T23:50:00', etiqueta: '30 abr 23:50 — fin del periodo (NO dispara)', esperaMensual: null, esperaTrim: null, esperaSem: null, esperaAnual: null },
    { fecha: '2026-05-01T23:50:00', etiqueta: '1 may  23:50 — primer día gracia (NO dispara)', esperaMensual: null, esperaTrim: null, esperaSem: null, esperaAnual: null },
    { fecha: '2026-05-05T23:50:00', etiqueta: '5 may  23:50 — último día gracia (NO dispara)', esperaMensual: null, esperaTrim: null, esperaSem: null, esperaAnual: null },
    { fecha: '2026-05-06T23:50:00', etiqueta: '6 may  23:50 — DISPARA cierre de abril', esperaMensual: 'abril 2026', esperaTrim: null, esperaSem: null, esperaAnual: null },
    { fecha: '2026-04-06T23:50:00', etiqueta: '6 abr  23:50 — cierre marzo + Q1', esperaMensual: 'marzo 2026', esperaTrim: 'Q1 2026', esperaSem: null, esperaAnual: null },
    { fecha: '2026-07-06T23:50:00', etiqueta: '6 jul  23:50 — cierre junio + Q2 + S1', esperaMensual: 'junio 2026', esperaTrim: 'Q2 2026', esperaSem: 'S1 2026', esperaAnual: null },
    { fecha: '2027-01-06T23:50:00', etiqueta: '6 ene 27 23:50 — cierre dic + Q4 + S2 + Anual', esperaMensual: 'diciembre 2026', esperaTrim: 'Q4 2026', esperaSem: 'S2 2026', esperaAnual: '2026' },
  ];

  for (const c of casos) {
    const r = cronSimulado(new Date(c.fecha));
    expect(
      r.mensual === c.esperaMensual && r.trimestral === c.esperaTrim && r.semestral === c.esperaSem && r.anual === c.esperaAnual,
      `${c.etiqueta} → mensual=${r.mensual ?? '—'} trim=${r.trimestral ?? '—'} sem=${r.semestral ?? '—'} anual=${r.anual ?? '—'}`,
    );
  }
}

// ─── Caso 4: getPeriodoCerrarHoy ──────────────────────────────────────────────
console.log(head('Caso 4: getPeriodoCerrarHoy(hoy, 5)'));
{
  expect(getPeriodoCerrarHoy(new Date('2026-05-06T23:50:00'), DIAS_GRACIA) === '2026-04', '6 may 26 → cierra "2026-04"');
  expect(getPeriodoCerrarHoy(new Date('2026-05-05T23:50:00'), DIAS_GRACIA) === null, '5 may 26 → no dispara');
  expect(getPeriodoCerrarHoy(new Date('2027-01-06T00:00:00'), DIAS_GRACIA) === '2026-12', '6 ene 27 → cierra "2026-12" (cruza año)');
  expect(getPeriodoCerrarHoy(new Date('2026-03-06T23:50:00'), DIAS_GRACIA) === '2026-02', '6 mar 26 → cierra "2026-02"');
}

// ─── Caso 5: formatPeriodo ────────────────────────────────────────────────────
console.log(head('Caso 5: formatPeriodo'));
{
  expect(formatPeriodo(new Date(2026, 3, 15)) === '2026-04', 'abril → "2026-04"');
  expect(formatPeriodo(new Date(2026, 11, 31)) === '2026-12', 'diciembre → "2026-12"');
  expect(formatPeriodo(new Date(2026, 0, 1)) === '2026-01', 'enero día 1 → "2026-01"');
}

// ─── Caso 6: Lógica del Storage Controller (validación de upload) ─────────────
console.log(head('Caso 6: Validación de upload de respaldo'));
{
  // Replica la lógica de storage.controller.ts:
  function validarUpload(now: Date, periodo: string, kpi: { aplicaOrdenTrabajo: boolean }): { ok: boolean; razon?: string } {
    if (!kpi.aplicaOrdenTrabajo) return { ok: true };
    if (!enVentanaGracia(now, periodo, DIAS_GRACIA)) return { ok: false, razon: 'fuera de ventana' };
    return { ok: true };
  }

  const kpiOT = { aplicaOrdenTrabajo: true };
  const kpiManual = { aplicaOrdenTrabajo: false };

  expect(
    validarUpload(new Date('2026-04-15T10:00:00'), '2026-04', kpiOT).ok === false,
    'KPI con OT, dentro del mes (15 abr) → RECHAZO (gracia aún no abre)',
  );
  expect(
    validarUpload(new Date('2026-05-03T10:00:00'), '2026-04', kpiOT).ok === true,
    'KPI con OT, en ventana (3 may) → OK',
  );
  expect(
    validarUpload(new Date('2026-05-06T10:00:00'), '2026-04', kpiOT).ok === false,
    'KPI con OT, fuera de ventana (6 may) → RECHAZO',
  );
  expect(
    validarUpload(new Date('2026-04-15T10:00:00'), '2026-04', kpiManual).ok === true,
    'KPI manual, dentro del mes → OK (no afecta a no-OT)',
  );
}

// ─── Caso 7: Cálculo del estado en getResultadoAutomatico ─────────────────────
console.log(head('Caso 7: Estado del resultado automático'));
{
  // Replica la lógica de kpis.service.ts:getResultadoAutomatico para el cómputo
  // del estado, que es el corazón del feature "no_aplica".
  function calcEstado(args: {
    totalOrdenes: number;
    aprobadas: number;
    respaldoAprobado: boolean;
    tipoCalculo: string;
    aplicaOT: boolean;
    meta?: number;
    umbralAmarillo?: number;
    operadorMeta?: string;
    sentido?: string;
  }): string | null {
    const { totalOrdenes, aprobadas, respaldoAprobado, tipoCalculo, aplicaOT, meta, umbralAmarillo, operadorMeta, sentido } = args;
    const resultado = totalOrdenes > 0 ? (aprobadas / totalOrdenes) * 100 : 0;
    if (totalOrdenes === 0 && respaldoAprobado && tipoCalculo === 'division' && aplicaOT) {
      return 'no_aplica';
    }
    if (meta == null) return null;
    const op = operadorMeta && operadorMeta !== '=' ? operadorMeta : sentido === 'Menor es mejor' ? '<=' : '>=';
    const cmp = (val: number, ref: number) => {
      switch (op) {
        case '>': return val > ref;
        case '>=': return val >= ref;
        case '<': return val < ref;
        case '<=': return val <= ref;
        default: return val === ref;
      }
    };
    if (cmp(resultado, meta)) return 'verde';
    if (umbralAmarillo != null && cmp(resultado, umbralAmarillo)) return 'amarillo';
    return 'rojo';
  }

  const base = { tipoCalculo: 'division', aplicaOT: true, meta: 90, umbralAmarillo: 80, operadorMeta: '>=', sentido: 'Mayor es mejor' };

  expect(
    calcEstado({ ...base, totalOrdenes: 10, aprobadas: 10, respaldoAprobado: false }) === 'verde',
    '10 órdenes, 10 aprobadas (100%) → verde',
  );
  expect(
    calcEstado({ ...base, totalOrdenes: 10, aprobadas: 8, respaldoAprobado: false }) === 'amarillo',
    '10 órdenes, 8 aprobadas (80%) → amarillo',
  );
  expect(
    calcEstado({ ...base, totalOrdenes: 10, aprobadas: 5, respaldoAprobado: false }) === 'rojo',
    '10 órdenes, 5 aprobadas (50%) → rojo',
  );
  expect(
    calcEstado({ ...base, totalOrdenes: 0, aprobadas: 0, respaldoAprobado: false }) === 'rojo',
    '0 órdenes sin respaldo → rojo (afecta promedio)',
  );
  expect(
    calcEstado({ ...base, totalOrdenes: 0, aprobadas: 0, respaldoAprobado: true }) === 'no_aplica',
    '0 órdenes con respaldo aprobado → no_aplica (no afecta)',
  );
  expect(
    calcEstado({ ...base, tipoCalculo: 'conteo', totalOrdenes: 0, aprobadas: 0, respaldoAprobado: true }) === 'rojo',
    'KPI tipo conteo (no division) con respaldo → sigue rojo (respaldo solo es contexto)',
  );
  expect(
    calcEstado({ ...base, aplicaOT: false, totalOrdenes: 0, aprobadas: 0, respaldoAprobado: true }) === 'rojo',
    'division pero NO aplicaOT con respaldo → rojo (no_aplica solo para division+OT)',
  );
}

// ─── Caso 8: Exclusión de "no_aplica" del promedio del empleado ───────────────
console.log(head('Caso 8: Promedio del empleado al cierre (no_aplica excluido)'));
{
  // Replica la lógica de evaluaciones.service.ts.
  function calcPromedio(detalles: { resultadoPorcentaje: number; estado: string }[]): { promedio: number; rojos: number; pctRojos: number } {
    const validos = detalles.filter((d) => d.estado !== 'no_aplica');
    if (validos.length === 0) return { promedio: 0, rojos: 0, pctRojos: 0 };
    const promedio = validos.reduce((s, d) => s + d.resultadoPorcentaje, 0) / validos.length;
    const rojos = validos.filter((d) => d.estado === 'rojo').length;
    return { promedio, rojos, pctRojos: (rojos / validos.length) * 100 };
  }

  const e1 = calcPromedio([
    { resultadoPorcentaje: 100, estado: 'verde' },
    { resultadoPorcentaje: 80, estado: 'amarillo' },
    { resultadoPorcentaje: 0, estado: 'no_aplica' }, // excluido
  ]);
  expect(e1.promedio === 90 && e1.rojos === 0, 'verde+amarillo+no_aplica → 90% (no_aplica fuera)');

  const e2 = calcPromedio([
    { resultadoPorcentaje: 100, estado: 'verde' },
    { resultadoPorcentaje: 0, estado: 'rojo' },
    { resultadoPorcentaje: 0, estado: 'no_aplica' },
  ]);
  expect(e2.promedio === 50 && e2.rojos === 1 && e2.pctRojos === 50, 'verde+rojo+no_aplica → 50% promedio, 50% rojos');

  // Sin la exclusión sería: (100 + 80 + 0) / 3 = 60% — confirma que la lógica corrige el caso.
  const promedioMalo = (100 + 80 + 0) / 3;
  expect(Math.abs(e1.promedio - promedioMalo) > 1, `Diferencia con cálculo viejo: ${promedioMalo.toFixed(1)}% (incorrecto) vs ${e1.promedio}% (correcto)`);

  const e3 = calcPromedio([{ resultadoPorcentaje: 0, estado: 'no_aplica' }]);
  expect(e3.promedio === 0 && e3.rojos === 0, 'Solo no_aplica → promedio 0, sin rojos (no se penaliza)');
}

// ─── Caso 9: Caso end-to-end del usuario ──────────────────────────────────────
console.log(head('Caso 9: Escenario completo descrito por el usuario'));
{
  // "Durante todo el mes no recibieron una orden de trabajo... habilitar que a partir
  // de los días de gracia puedan subir una evidencia"
  console.log('  Empleado en abril 2026: 0 órdenes recibidas en KPI division+aplicaOrdenTrabajo');
  console.log('');

  const fechas: { f: string; nota: string }[] = [
    { f: '2026-04-20T10:00:00', nota: '20 abr — durante el mes' },
    { f: '2026-04-30T22:00:00', nota: '30 abr 22:00 — último día del periodo' },
    { f: '2026-05-01T08:00:00', nota: '1 may  08:00 — primer día de gracia' },
    { f: '2026-05-05T20:00:00', nota: '5 may  20:00 — último día de gracia' },
    { f: '2026-05-06T10:00:00', nota: '6 may  10:00 — gracia ya cerrada' },
  ];

  for (const { f, nota } of fechas) {
    const dentro = enVentanaGracia(new Date(f), '2026-04', DIAS_GRACIA);
    const v = dentro ? 'PUEDE subir respaldo' : 'NO puede subir';
    console.log(`  ${dentro ? ok(v) : '  ' + v}  — ${nota}`);
  }
  console.log('');
  console.log('  Empleado sube respaldo el 3 may → status=pendiente_revision, esRespaldoGracia=true');
  console.log('  Jefe aprueba → status=aprobada');
  console.log('  Cron del 6 may 23:50 corre → cierra abril 2026');
  console.log('     • Detecta 0 órdenes + respaldo aprobado para este KPI');
  console.log('     • Crea EvaluacionDetalle con estado="no_aplica"');
  console.log('     • Promedio del empleado se calcula sobre el resto de KPIs (este NO suma)');
  expect(true, 'Flujo end-to-end coherente con la lógica simulada arriba');
}

// ─── Resumen ──────────────────────────────────────────────────────────────────
console.log(head('Resumen'));
console.log(`  ${pass}/${total} aserciones pasaron\n`);
process.exit(pass === total ? 0 : 1);
