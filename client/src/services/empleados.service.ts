import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

export const empleadosService = {
  getAll: async (filters?: { areaId?: string; role?: string; activo?: boolean; search?: string }) => {
    let url = API_ENDPOINTS.empleados;
    const params = new URLSearchParams();
    
    if (filters?.areaId) params.append('areaId', filters.areaId);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.activo !== undefined) params.append('activo', String(filters.activo));
    if (filters?.search) params.append('search', filters.search);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.empleadoById(id));
    return response.data;
  },

  getByArea: async (areaId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.empleadosByArea(areaId));
    return response.data;
  },

  search: async (query: string) => {
    const response = await apiClient.get(`${API_ENDPOINTS.empleadosSearch}?q=${query}`);
    return response.data;
  },

  getEstadisticas: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.empleadoEstadisticas(id));
    return response.data;
  },

  getEstadisticasGlobales: async () => {
    const response = await apiClient.get(API_ENDPOINTS.empleadosEstadisticas);
    return response.data;
  },

  getEvaluaciones: async (id: string) => {
    const response = await apiClient.get(`${API_ENDPOINTS.empleadoById(id)}/evaluaciones`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.empleados, data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(API_ENDPOINTS.empleadoById(id), data);
    return response.data;
  },

  toggle: async (id: string) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.empleadoById(id)}/toggle`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.empleadoById(id));
    return response.data;
  },
  createBulk: async (data: any[]) => {
    // Apunta al nuevo endpoint que creamos en el backend
    const response = await apiClient.post(`${API_ENDPOINTS.empleados}/bulk`, data);
    return response.data;
  },
};