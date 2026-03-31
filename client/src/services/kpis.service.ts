import apiClient from "./api.service";
import { API_ENDPOINTS } from "../config/api";

export const kpisService = {
  getAll: async (filters?: { areaId?: string; activo?: boolean }) => {
    let url = API_ENDPOINTS.kpis;
    const params = new URLSearchParams();

    if (filters?.areaId) params.append("areaId", filters.areaId);
    if (filters?.activo !== undefined)
      params.append("activo", String(filters.activo));

    if (params.toString()) url += `?${params.toString()}`;

    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.kpiById(id));
    return response.data;
  },

  getByArea: async (areaId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.kpisByArea(areaId));
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.kpis, data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(API_ENDPOINTS.kpiById(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.kpiById(id));
    return response.data;
  },

  calcular: async (data: {
    kpiId: string;
    valores: Record<string, any>;
  }): Promise<any> => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.kpis}/calcular`,
      data,
    );
    return response.data;
  },

  validarFormula: async (data: {
    formulaCalculo: string;
    tipoCalculo: string;
  }): Promise<any> => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.kpis}/validar-formula`,
      data,
    );
    return response.data;
  },

  toggle: async (id: string): Promise<any> => {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.kpiById(id)}/toggle`,
    );
    return response.data;
  },
  getMisKpis: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.kpis}/mis-kpis`);
    return response.data;
  },

  getMisEvidencias: async (periodo?: string) => {
    const url = periodo
      ? `${API_ENDPOINTS.kpis}/mis-evidencias?periodo=${periodo}`
      : `${API_ENDPOINTS.kpis}/mis-evidencias`;
    const response = await apiClient.get(url);
    return response.data;
  },

  subirEvidencia: async (data: {
    kpiId: string;
    archivoUrl: string;
    tipo: string;
    nombre: string;
    tamanio?: number;
    valorNumerico?: number;
    nota?: string;
    periodo?: string;
  }) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.kpis}/evidencias`,
      data,
    );
    return response.data;
  },

  revisarEvidencia: async (
    id: string,
    data: { status: string; motivoRechazo?: string },
  ) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.kpis}/evidencias/${id}/revisar`,
      data,
    );
    return response.data;
  },

  apelarEvidencia: async (id: string, apelacion: string) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.kpis}/evidencias/${id}/apelar`,
      { apelacion },
    );
    return response.data;
  },

  getEvidenciasPendientes: async () => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.kpis}/pendientes-revision`,
    );
    return response.data;
  },

  getResultadosAutoEquipo: async (periodo?: string) => {
    const url = periodo
      ? `${API_ENDPOINTS.kpis}/resultados-auto-equipo?periodo=${periodo}`
      : `${API_ENDPOINTS.kpis}/resultados-auto-equipo`;
    const response = await apiClient.get(url);
    return response.data;
  },
};
