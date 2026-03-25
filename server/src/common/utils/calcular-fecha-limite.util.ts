/**
 * calcular-fecha-limite.util.ts
 *
 * Calcula la fecha límite sumando horas laborales desde un momento de inicio.
 *
 * Horario laboral:
 *   Lunes – Jueves : 07:30 – 17:30  (10 h/día)
 *   Viernes        : 07:30 – 16:30  (9 h/día)
 *   Sábado/Domingo : no laboral
 *
 * Uso:
 *   import { calcularFechaLimiteLaboral } from '../utils/calcular-fecha-limite.util';
 *   const fechaLimite = calcularFechaLimiteLaboral(new Date(), kpi.horasLimiteOrden);
 */

interface HorarioDia {
  inicio: { h: number; m: number };
  fin: { h: number; m: number };
}

const HORARIO: Record<number, HorarioDia | null> = {
  0: null,
  1: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } },
  2: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } },
  3: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } },
  4: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } },
  5: { inicio: { h: 7, m: 30 }, fin: { h: 16, m: 30 } },
  6: null,
};

function avanzarAlSiguienteMomentoLaboral(cursor: Date): Date {
  const r = new Date(cursor);
  for (let intentos = 0; intentos < 14; intentos++) {
    const horario = HORARIO[r.getDay()];
    if (!horario) {
      r.setDate(r.getDate() + 1);
      r.setHours(0, 0, 0, 0);
      continue;
    }
    const minActual = r.getHours() * 60 + r.getMinutes();
    const minInicio = horario.inicio.h * 60 + horario.inicio.m;
    const minFin = horario.fin.h * 60 + horario.fin.m;
    if (minActual < minInicio) {
      r.setHours(horario.inicio.h, horario.inicio.m, 0, 0);
      return r;
    }
    if (minActual >= minFin) {
      r.setDate(r.getDate() + 1);
      r.setHours(0, 0, 0, 0);
      continue;
    }
    return r;
  }
  return r;
}

export function calcularFechaLimiteLaboral(
  inicio: Date,
  horasLaborales: number,
): Date {
  if (horasLaborales <= 0) {
    throw new Error('horasLimiteOrden debe ser mayor a 0');
  }

  let minutosRestantes = horasLaborales * 60;
  let cursor = new Date(inicio);
  cursor.setSeconds(0, 0);
  cursor = avanzarAlSiguienteMomentoLaboral(cursor);

  while (minutosRestantes > 0) {
    const horario = HORARIO[cursor.getDay()];
    if (!horario) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
      cursor = avanzarAlSiguienteMomentoLaboral(cursor);
      continue;
    }
    const minActual = cursor.getHours() * 60 + cursor.getMinutes();
    const minFin = horario.fin.h * 60 + horario.fin.m;
    const disponibleHoy = minFin - minActual;
    if (disponibleHoy <= 0) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
      cursor = avanzarAlSiguienteMomentoLaboral(cursor);
      continue;
    }
    if (minutosRestantes <= disponibleHoy) {
      cursor.setMinutes(cursor.getMinutes() + minutosRestantes);
      minutosRestantes = 0;
    } else {
      minutosRestantes -= disponibleHoy;
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
      cursor = avanzarAlSiguienteMomentoLaboral(cursor);
    }
  }

  return cursor;
}
