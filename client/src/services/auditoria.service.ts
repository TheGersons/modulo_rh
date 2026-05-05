import apiClient from './api.service';

export interface AuditoriaFiltros {
  periodo?: string;
  areaId?: string;
  empleadoId?: string;
  status?: string;
  fueraDeTiempo?: boolean;
  page?: number;
  pageSize?: number;
}

function buildParams(filtros: AuditoriaFiltros): string {
  const p = new URLSearchParams();
  if (filtros.periodo) p.set('periodo', filtros.periodo);
  if (filtros.areaId) p.set('areaId', filtros.areaId);
  if (filtros.empleadoId) p.set('empleadoId', filtros.empleadoId);
  if (filtros.status) p.set('status', filtros.status);
  if (filtros.fueraDeTiempo !== undefined)
    p.set('fueraDeTiempo', String(filtros.fueraDeTiempo));
  if (filtros.page) p.set('page', String(filtros.page));
  if (filtros.pageSize) p.set('pageSize', String(filtros.pageSize));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const auditoriaService = {
  getEvidenciasKpi: async (filtros: AuditoriaFiltros = {}) => {
    const res = await apiClient.get(
      `auditoria/evidencias-kpi${buildParams(filtros)}`,
    );
    return res.data;
  },

  getEvidenciasOrden: async (filtros: AuditoriaFiltros = {}) => {
    const res = await apiClient.get(
      `auditoria/evidencias-orden${buildParams(filtros)}`,
    );
    return res.data;
  },

  getResumen: async (
    filtros: Pick<AuditoriaFiltros, 'periodo' | 'areaId' | 'empleadoId'> = {},
  ) => {
    const res = await apiClient.get(`auditoria/resumen${buildParams(filtros)}`);
    return res.data;
  },
};
