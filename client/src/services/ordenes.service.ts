import apiClient from "./api.service";

export const ordenesService = {
  getAll: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get("/ordenes-trabajo", { params });
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/ordenes-trabajo/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<any> => {
    const response = await apiClient.post("/ordenes-trabajo", data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/ordenes-trabajo/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/ordenes-trabajo/${id}`);
    return response.data;
  },

  subirEvidencia: async (id: string, formData: FormData): Promise<any> => {
    const response = await apiClient.post(
      `/ordenes-trabajo/${id}/evidencia`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  revisarEvidencia: async (
    id: string,
    data: { aprobada: boolean; comentarios?: string },
  ): Promise<any> => {
    const response = await apiClient.post(
      `/ordenes-trabajo/${id}/revisar`,
      data,
    );
    return response.data;
  },

  getMisOrdenes: async (): Promise<any[]> => {
    const response = await apiClient.get("/ordenes-trabajo/mis-ordenes");
    return response.data;
  },
};
