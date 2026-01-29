import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

export const alertasService = {
  getAll: async (filters?: { tipo?: string; nivel?: string; status?: string; activas?: boolean }) => {
    let url = API_ENDPOINTS.alertas;
    const params = new URLSearchParams();
    
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.nivel) params.append('nivel', filters.nivel);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.activas) params.append('activas', 'true');
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  getActivas: async () => {
    const response = await apiClient.get(API_ENDPOINTS.alertasActivas);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`${API_ENDPOINTS.alertas}/${id}`);
    return response.data;
  },

  getByArea: async (areaId: string) => {
    const response = await apiClient.get(`${API_ENDPOINTS.alertas}/area/${areaId}`);
    return response.data;
  },

  generarAutomaticas: async () => {
    const response = await apiClient.post(API_ENDPOINTS.alertasGenerarAutomaticas);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.alertas, data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.alertas}/${id}`, data);
    return response.data;
  },

  resolver: async (id: string, data: { accionSugerida: string; responsable?: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.alertaResolver(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.alertas}/${id}`);
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.alertas}/estadisticas`);
    return response.data;
  },
};