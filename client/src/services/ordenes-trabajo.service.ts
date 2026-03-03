import apiClient from "./api.service";
import { API_ENDPOINTS } from "../config/api";

// ============================================
// TIPOS
// ============================================
export interface OrdenTrabajo {
  id: string;
  kpiId: string;
  empleadoId: string;
  creadorId: string;
  titulo: string;
  descripcion: string;
  cantidadTareas: number;
  tipoOrden: string;
  status: string;
  fechaInicio: string;
  fechaLimite: string;
  fechaCompletada?: string;
  tareasCompletadas: number;
  progreso: number;
  resultadoFinal?: number;
  kpi: {
    key: string;
    indicador: string;
  };
  empleado: {
    nombre: string;
    apellido: string;
  };
  creador: {
    nombre: string;
    apellido: string;
  };
  tareas?: Tarea[];
}

export interface Tarea {
  id: string;
  ordenTrabajoId: string;
  descripcion: string;
  orden: number;
  completada: boolean;
  fueraDeTiempo: boolean;
  fechaCompletada?: string;
  evidencias?: Evidencia[];
}

export interface Evidencia {
  id: string;
  tareaId: string;
  archivoUrl: string;
  tipo: string;
  nombre: string;
  intento: number;
  status: string;
  motivoRechazo?: string;
  esFueraDeTiempo: boolean;
  apelacion?: string;
  respuestaApelacion?: string;
  fechaSubida: string;
}

export interface CreateOrdenDto {
  kpiId: string;
  empleadoId: string;
  titulo: string;
  descripcion: string;
  cantidadTareas: number;
  fechaLimite: string;
  tipoOrden?: string;
  tareas?: Array<{
    descripcion: string;
    orden: number;
  }>;
}

export interface SubirEvidenciaDto {
  tareaId: string;
  archivoUrl: string;
  tipo: string;
  nombre: string;
  tamanio?: number;
}

// ============================================
// SERVICE
// ============================================
export const ordenesTrabajoService = {
  // CRUD Órdenes
  getAll: async (filters?: {
    empleadoId?: string;
    creadorId?: string;
    kpiId?: string;
    status?: string;
    tipoOrden?: string;
  }): Promise<OrdenTrabajo[]> => {
    const params = new URLSearchParams();
    if (filters?.empleadoId) params.append("empleadoId", filters.empleadoId);
    if (filters?.creadorId) params.append("creadorId", filters.creadorId);
    if (filters?.kpiId) params.append("kpiId", filters.kpiId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.tipoOrden) params.append("tipoOrden", filters.tipoOrden);

    const url = params.toString()
      ? `${API_ENDPOINTS.ordenesTrabajo}?${params.toString()}`
      : API_ENDPOINTS.ordenesTrabajo;

    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: string): Promise<OrdenTrabajo> => {
    const response = await apiClient.get(API_ENDPOINTS.ordenTrabajoById(id));
    return response.data;
  },

  create: async (data: CreateOrdenDto): Promise<OrdenTrabajo> => {
    const response = await apiClient.post(API_ENDPOINTS.ordenesTrabajo, data);
    return response.data;
  },

  createBulk: async (
    data: CreateOrdenDto,
    empleadoIds: string[],
  ): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.ordenTrabajoBulk, {
      orden: data,
      empleadoIds,
    });
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateOrdenDto>,
  ): Promise<OrdenTrabajo> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ordenTrabajoById(id),
      data,
    );
    return response.data;
  },

  pausar: async (id: string, motivo: string): Promise<OrdenTrabajo> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ordenTrabajoPausar(id),
      { motivo },
    );
    return response.data;
  },

  reanudar: async (id: string): Promise<OrdenTrabajo> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ordenTrabajoReanudar(id),
    );
    return response.data;
  },

  cancelar: async (id: string): Promise<OrdenTrabajo> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ordenTrabajoCancelar(id),
    );
    return response.data;
  },

  extenderFecha: async (
    id: string,
    nuevaFecha: string,
    motivo: string,
  ): Promise<OrdenTrabajo> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ordenTrabajoExtenderFecha(id),
      {
        nuevaFecha,
        motivo,
      },
    );
    return response.data;
  },

  calcularProgreso: async (id: string): Promise<any> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ordenTrabajoCalcularProgreso(id),
    );
    return response.data;
  },

  // Tareas
  getTareas: async (ordenId: string): Promise<Tarea[]> => {
    const response = await apiClient.get(API_ENDPOINTS.tareasByOrden(ordenId));
    return response.data;
  },

  crearTarea: async (data: {
    ordenTrabajoId: string;
    descripcion: string;
    orden: number;
  }): Promise<Tarea> => {
    const response = await apiClient.post(API_ENDPOINTS.tareas, data);
    return response.data;
  },

  // Evidencias
  subirEvidencia: async (data: SubirEvidenciaDto): Promise<Evidencia> => {
    const response = await apiClient.post(API_ENDPOINTS.evidencias, data);
    return response.data;
  },

  revisarEvidencia: async (
    id: string,
    status: "aprobada" | "rechazada",
    motivoRechazo?: string,
  ): Promise<Evidencia> => {
    const response = await apiClient.post(API_ENDPOINTS.evidenciaRevisar(id), {
      status,
      motivoRechazo,
    });
    return response.data;
  },

  apelarEvidencia: async (
    id: string,
    apelacion: string,
  ): Promise<Evidencia> => {
    const response = await apiClient.post(API_ENDPOINTS.evidenciaApelar(id), {
      apelacion,
    });
    return response.data;
  },

  responderApelacion: async (
    id: string,
    respuesta: string,
    confirmaRechazo: boolean,
  ): Promise<Evidencia> => {
    const response = await apiClient.post(
      API_ENDPOINTS.evidenciaResponderApelacion(id),
      {
        respuesta,
        confirmaRechazo,
      },
    );
    return response.data;
  },

  getEvidencias: async (tareaId: string): Promise<Evidencia[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.evidenciasByTarea(tareaId),
    );
    return response.data;
  },

  // Solicitudes de Tarea
  solicitarTarea: async (data: {
    ordenTrabajoId: string;
    descripcion: string;
    justificacion: string;
  }): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.solicitudesTarea, data);
    return response.data;
  },

  getSolicitudesTarea: async (filters?: {
    ordenTrabajoId?: string;
    empleadoId?: string;
    status?: string;
  }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters?.ordenTrabajoId)
      params.append("ordenTrabajoId", filters.ordenTrabajoId);
    if (filters?.empleadoId) params.append("empleadoId", filters.empleadoId);
    if (filters?.status) params.append("status", filters.status);

    const url = params.toString()
      ? `${API_ENDPOINTS.solicitudesTarea}?${params.toString()}`
      : API_ENDPOINTS.solicitudesTarea;

    const response = await apiClient.get(url);
    return response.data;
  },

  responderSolicitudTarea: async (
    id: string,
    status: "aprobada" | "rechazada",
    motivoRechazo?: string,
    fechaLimite?: string,
  ): Promise<any> => {
    const response = await apiClient.post(
      API_ENDPOINTS.solicitudTareaResponder(id),
      {
        status,
        motivoRechazo,
        fechaLimite,
      },
    );
    return response.data;
  },

  // Solicitudes de Edición
  solicitarEdicion: async (data: {
    ordenTrabajoId: string;
    campoAEditar: string;
    valorNuevo: string;
    justificacion: string;
  }): Promise<any> => {
    const response = await apiClient.post(
      API_ENDPOINTS.solicitudesEdicion,
      data,
    );
    return response.data;
  },

  getSolicitudesEdicion: async (filters?: {
    ordenTrabajoId?: string;
    solicitanteId?: string;
    status?: string;
  }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters?.ordenTrabajoId)
      params.append("ordenTrabajoId", filters.ordenTrabajoId);
    if (filters?.solicitanteId)
      params.append("solicitanteId", filters.solicitanteId);
    if (filters?.status) params.append("status", filters.status);

    const url = params.toString()
      ? `${API_ENDPOINTS.solicitudesEdicion}?${params.toString()}`
      : API_ENDPOINTS.solicitudesEdicion;

    const response = await apiClient.get(url);
    return response.data;
  },

  responderSolicitudEdicion: async (
    id: string,
    status: "aprobada" | "rechazada",
    motivoRechazo?: string,
  ): Promise<any> => {
    const response = await apiClient.post(
      API_ENDPOINTS.solicitudEdicionResponder(id),
      {
        status,
        motivoRechazo,
      },
    );
    return response.data;
  },
};
