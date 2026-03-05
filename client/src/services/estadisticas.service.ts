import apiClient from "./api.service";
import { API_ENDPOINTS } from "../config/api";

export const estadisticasService = {
  getGlobales: async () => {
    const response = await apiClient.get(API_ENDPOINTS.estadisticasGlobales);
    return response.data;
  },

  getByArea: async (areaId: string) => {
    const response = await apiClient.get(`estadisticas/area?areaId=${areaId}`);
    return response.data;
  },

  getByEmpleado: async (empleadoId: string) => {
    const response = await apiClient.get(
      `estadisticas/empleado?empleadoId=${empleadoId}`,
    );
    return response.data;
  },

  getTendencias: async (meses: number = 6) => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.estadisticasTendencias}?meses=${meses}`,
    );
    return response.data;
  },

  getRankings: async () => {
    const response = await apiClient.get(API_ENDPOINTS.estadisticasRankings);
    return response.data;
  },

  getDashboard: async () => {
    const response = await apiClient.get(API_ENDPOINTS.estadisticasDashboard);
    return response.data;
  },

  getRankingAreas: async () => {
    const response = await apiClient.get("estadisticas/ranking-areas");
    return response.data;
  },
};
