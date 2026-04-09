/**
 * calcular-fecha-limite.util.ts
 *
 * Calcula la fecha límite sumando horas laborales desde un momento de inicio.
 *
 * Horario laboral:
 *   Lunes – Viernes : 07:30 – 17:30  (10 h/día)
 *   Sábado/Domingo  : no laboral
 */

interface HorarioDia {
  inicio: { h: number; m: number };
  fin: { h: number; m: number };
}

const HORARIO: Record<number, HorarioDia | null> = {
  0: null, // Domingo
  1: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } }, // Lunes
  2: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } }, // Martes
  3: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } }, // Miércoles
  4: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } }, // Jueves
  5: { inicio: { h: 7, m: 30 }, fin: { h: 17, m: 30 } }, // Viernes
  6: null, // Sábado
};

/** Avanza el cursor al próximo instante dentro del horario laboral. */
function avanzarAlSiguienteMomentoLaboral(cursor: Date): Date {
  const r = new Date(cursor);
  let guardaInfinita = 0;

  while (guardaInfinita++ < 30) {
    const horario = HORARIO[r.getDay()];

    if (!horario) {
      // Día no laboral → saltar al día siguiente al inicio
      r.setDate(r.getDate() + 1);
      r.setHours(0, 0, 0, 0);
      continue;
    }

    const minActual = r.getHours() * 60 + r.getMinutes();
    const minInicio = horario.inicio.h * 60 + horario.inicio.m;
    const minFin = horario.fin.h * 60 + horario.fin.m;

    if (minActual < minInicio) {
      // Antes del inicio del día → mover al inicio
      r.setHours(horario.inicio.h, horario.inicio.m, 0, 0);
      return r;
    }

    if (minActual >= minFin) {
      // Pasado el fin del día → pasar al día siguiente
      r.setDate(r.getDate() + 1);
      r.setHours(0, 0, 0, 0);
      continue;
    }

    // Dentro del horario
    return r;
  }

  return r; // No debería llegar aquí
}

export function calcularFechaLimiteLaboral(
  inicio: Date,
  horasLaborales: number,
): Date {
  if (horasLaborales <= 0) {
    throw new Error('horasLaborales debe ser mayor a 0');
  }

  let minutosRestantes = Math.round(horasLaborales * 60);
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
      // El plazo cabe dentro del día → avanzar exactamente los minutos restantes
      cursor.setMinutes(cursor.getMinutes() + minutosRestantes);
      minutosRestantes = 0;
    } else {
      // Consume el resto del día y pasa al siguiente
      minutosRestantes -= disponibleHoy;
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
      cursor = avanzarAlSiguienteMomentoLaboral(cursor);
    }
  }

  return cursor;
}
