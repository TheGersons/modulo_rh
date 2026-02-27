import apiClient from "./api.service";

export const puestosService = {
  getAll: async (areaId?: string): Promise<any[]> => {
    const params = areaId ? { areaId } : {};
    const response = await apiClient.get("/puestos", { params });
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/puestos/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<any> => {
    const response = await apiClient.post("/puestos", data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/puestos/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/puestos/${id}`);
    return response.data;
  },
};
