// FRONTEND - /src/db/services/userService.ts
import { api } from "../config/api";

export const userService = {
  // Crear usuario (registro normal)
  createUser: async (userData: any) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Obtener perfil del usuario logueado
  getProfile: async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token guardado");

    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Actualizar perfil del usuario
  updateUser: async (id: string, updateData: any) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token guardado");

    const response = await api.put(`/users/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};
