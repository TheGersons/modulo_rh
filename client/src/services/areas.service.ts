import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

export const areasService = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.areas);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.areaById(id));
    return response.data;
  },

  getEmpleados: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.areaEmpleados(id));
    return response.data;
  },

  getKpis: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.areaKpis(id));
    return response.data;
  },

  getEstadisticas: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.areaEstadisticas(id));
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.areas, data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(API_ENDPOINTS.areaById(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.areaById(id));
    return response.data;
  },

  recalcular: async (id: string) => {
    const response = await apiClient.post(API_ENDPOINTS.areaRecalcular(id));
    return response.data;
  },
};