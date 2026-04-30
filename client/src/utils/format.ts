/**
 * Formatea un número a máximo 2 decimales, sin ceros sobrantes.
 *   1.0000000001 → "1"
 *   50.5         → "50.5"
 *   50.123456    → "50.12"
 *   undefined    → ""
 */
export function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '';
  return String(Math.round(n * 100) / 100);
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
