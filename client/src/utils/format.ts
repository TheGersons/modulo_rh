/**
 * Formatea un número a máximo 2 decimales, sin ceros sobrantes, con separador
 * de miles cuando aplica. Patrón: #,###,###.##
 *   1.0000000001 → "1"
 *   50.5         → "50.5"
 *   50.123456    → "50.12"
 *   1234         → "1,234"
 *   1234567.891  → "1,234,567.89"
 *   undefined    → ""
 */
export function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '';
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Formatea un valor con su unidad. Si la unidad es '%' la concatena pegada,
 * si es texto la separa con espacio. Si no hay unidad solo devuelve el número.
 */
export function fmtConUnidad(n: number | null | undefined, unidad?: string | null): string {
  const num = fmtNum(n);
  if (!num) return '';
  if (!unidad) return num;
  return unidad === '%' ? `${num}%` : `${num} ${unidad}`;
}
