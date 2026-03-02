import apiClient from "./api.service";
import { API_ENDPOINTS } from "../config/api";

export const evaluacionesService = {
  getAll: async (filters?: any) => {
    let url = API_ENDPOINTS.evaluaciones;
    const params = new URLSearchParams();

    if (filters?.empleadoId) params.append("empleadoId", filters.empleadoId);
    if (filters?.periodo) params.append("periodo", filters.periodo);
    if (filters?.anio) params.append("anio", String(filters.anio));
    if (filters?.status) params.append("status", filters.status);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.evaluacionById(id));
    return response.data;
  },

  getByEmpleado: async (empleadoId: string) => {
    const response = await apiClient.get(
      API_ENDPOINTS.evaluacionesByEmpleado(empleadoId),
    );
    return response.data;
  },

  getByArea: async (areaId: string) => {
    const response = await apiClient.get(
      API_ENDPOINTS.evaluacionesByArea(areaId),
    );
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.evaluaciones, data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.evaluacionById(id),
      data,
    );
    return response.data;
  },

  enviar: async (id: string) => {
    const response = await apiClient.post(API_ENDPOINTS.evaluacionEnviar(id));
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.evaluacionById(id));
    return response.data;
  },

  cerrarPeriodo: async (data: {
    periodo: string;
    anio: number;
    empleadoIds?: string[];
    areaId?: string;
  }): Promise<any> => {
    const response = await apiClient.post("/evaluaciones/cerrar-periodo", data);
    return response.data;
  },

  cerrar: async (id: string): Promise<any> => {
    const response = await apiClient.patch(`/evaluaciones/${id}/cerrar`);
    return response.data;
  },

  recalcular: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/evaluaciones/${id}/recalcular`);
    return response.data;
  },
};
