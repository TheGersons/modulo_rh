import { useEffect, useState } from 'react';
import {
  configuracionService,
  type PeriodoActivoData,
} from '../services/configuracion.service';

/**
 * Carga el período activo desde el backend (fuente de verdad: si no hay
 * Evaluacion del mes anterior, ese mes sigue abierto). Re-consulta cuando
 * la pestaña recupera el foco.
 */
export function usePeriodoActivo() {
  const [data, setData] = useState<PeriodoActivoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const d = await configuracionService.getPeriodoActivo();
      setData(d);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al cargar período activo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    const onFocus = () => cargar();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return { data, loading, error, recargar: cargar };
}
