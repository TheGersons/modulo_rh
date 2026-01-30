import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

interface DetalleRevision {
  kpiId: string;
  kpiNombre: string;
  motivo: string;
}

export const validacionesService = {
  create: async (data: {
    evaluacionId: string;
    empleadoId: string;
    status: string;
    motivoRevision?: string;
    detallesRevision?: DetalleRevision[];
    archivosAdjuntos?: string[];
  }) => {
    const response = await apiClient.post(API_ENDPOINTS.validaciones, data);
    return response.data;
  },

  getByEvaluacion: async (evaluacionId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.validacionByEvaluacion(evaluacionId));
    return response.data;
  },

  responder: async (id: string, data: { respuestaJefe: string; accionTomada?: string }) => {
    const response = await apiClient.patch(API_ENDPOINTS.validacionResponder(id), data);
    return response.data;
  },
};