import apiClient from './api.service';

export interface PeriodoActivoData {
  periodo: string; // "YYYY-MM"
  periodoActual: string; // "YYYY-MM"
  periodoAnterior: string; // "YYYY-MM"
  enGracia: boolean; // true si el período activo es el mes anterior
  enGraciaCalendario: boolean; // true si hoy cae 1..N del mes siguiente
  mesAnteriorAbierto: boolean; // true si no hay evaluación creada del mes anterior
  ventana: { inicio: string; fin: string };
  diasGracia: number;
}

export const configuracionService = {
  getPeriodoActivo: async (): Promise<PeriodoActivoData> => {
    const res = await apiClient.get('configuracion/periodo-activo');
    return res.data;
  },
};
