import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

export const planesAccionService = {
  getAll: async (filters?: { empleadoId?: string; status?: string; evaluacionId?: string }) => {
    let url = API_ENDPOINTS.planesAccion;
    const params = new URLSearchParams();

    if (filters?.empleadoId) params.append('empleadoId', filters.empleadoId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.evaluacionId) params.append('evaluacionId', filters.evaluacionId);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.planAccionById(id));
    return response.data;
  },

  getByEmpleado: async (empleadoId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.planesAccionByEmpleado(empleadoId));
    return response.data;
  },

  getByEvaluacion: async (evaluacionId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.planesAccionByEvaluacion(evaluacionId));
    return response.data;
  },

  getPendientesEnvio: async () => {
    const response = await apiClient.get(API_ENDPOINTS.planesAccionPendientesEnvio);
    return response.data;
  },

  getVencidos: async () => {
    const response = await apiClient.get(API_ENDPOINTS.planesAccionVencidos);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.planesAccion, data);
    return response.data;
  },

  crearAutomaticos: async (evaluacionId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.planesAccionCrearAutomaticos(evaluacionId));
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(API_ENDPOINTS.planAccionById(id), data);
    return response.data;
  },

  enviar: async (id: string) => {
    const response = await apiClient.post(API_ENDPOINTS.planAccionEnviar(id));
    return response.data;
  },

  aprobar: async (id: string, diasPlazo?: number) => {
    const response = await apiClient.post(API_ENDPOINTS.planAccionAprobar(id), { diasPlazo });
    return response.data;
  },

  rechazar: async (id: string, motivoRechazo: string) => {
    const response = await apiClient.post(API_ENDPOINTS.planAccionRechazar(id), { motivoRechazo });
    return response.data;
  },

  completar: async (id: string) => {
    const response = await apiClient.post(API_ENDPOINTS.planAccionCompletar(id));
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.planAccionById(id));
    return response.data;
  },
};