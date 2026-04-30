/**
 * Ventana de gracia para KPIs basados en órdenes de trabajo.
 *
 * Convención (DIAS_GRACIA = 5):
 *   - El periodo "YYYY-MM" cubre el mes calendario completo.
 *   - La ventana de gracia abarca los días 1..DIAS_GRACIA del MES SIGUIENTE.
 *   - Durante esa ventana se permite subir respaldos manuales a KPIs con
 *     aplicaOrdenTrabajo=true.
 *   - El cron de cierre corre el día (DIAS_GRACIA + 1) del mes siguiente,
 *     a las 23:50, y cierra el periodo del mes anterior.
 */

export interface VentanaGracia {
  inicio: Date; // primer día del mes siguiente, 00:00:00
  fin: Date; // último día de gracia, 23:59:59.999
}

function parsePeriodo(periodo: string): { anio: number; mes: number } {
  const [a, m] = periodo.split('-').map(Number);
  if (!a || !m || m < 1 || m > 12) {
    throw new Error(`Periodo inválido: ${periodo}`);
  }
  return { anio: a, mes: m };
}

/** Devuelve la ventana de gracia [inicio, fin] del periodo dado. */
export function getVentanaGracia(periodo: string, diasGracia: number): VentanaGracia {
  const { anio, mes } = parsePeriodo(periodo);
  // mes en JS es 0-indexed: si periodo = 2026-04 (abril), mes-1 = 3 → siguiente = 4 (mayo)
  const inicio = new Date(anio, mes, 1, 0, 0, 0, 0);
  const fin = new Date(anio, mes, diasGracia, 23, 59, 59, 999);
  return { inicio, fin };
}

/** True si "now" está dentro de la ventana de gracia del periodo. */
export function enVentanaGracia(now: Date, periodo: string, diasGracia: number): boolean {
  const { inicio, fin } = getVentanaGracia(periodo, diasGracia);
  return now >= inicio && now <= fin;
}

/** Formatea Date como "YYYY-MM". */
export function formatPeriodo(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Si hoy es el día (DIAS_GRACIA + 1) del mes y son ≥23:50, devuelve el periodo del mes
 * anterior que debe cerrarse. Si no, devuelve null.
 *
 * El cron usa esto para decidir cuándo y qué cerrar.
 */
export function getPeriodoCerrarHoy(now: Date, diasGracia: number): string | null {
  if (now.getDate() !== diasGracia + 1) return null;
  const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return formatPeriodo(mesAnterior);
}

/** Devuelve { anio, mes(0-11) } del periodo previo a uno dado. */
export function periodoAnterior(periodo: string): { anio: number; mes0: number } {
  const { anio, mes } = parsePeriodo(periodo);
  // mes-1 es 0-indexed actual; el anterior = mes-2 (0-indexed)
  const d = new Date(anio, mes - 2, 1);
  return { anio: d.getFullYear(), mes0: d.getMonth() };
}
