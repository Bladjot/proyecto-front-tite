import { api } from "../config/api";

type RegisterPayload = {
  name: string;
  lastName: string;
  rut: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    lastName: string;
    rut: string;
    roles: string[];
    permisos: string[];
  };
  access_token: string;
};

const getAuthPath = (resource: string) => {
  const baseURL = (api.defaults.baseURL || "").replace(/\/+$/, "");
  const needsApiPrefix = !/\/api$/i.test(baseURL);
  return needsApiPrefix ? `/api${resource}` : resource;
};

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post(getAuthPath("/auth/login"), { email, password });
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await api.post(getAuthPath("/auth/register"), payload);
    return response.data;
  },

  resetPassword: async (email: string) => {
    const response = await api.post(getAuthPath("/auth/forgot-password"), { email });
    return response.data;
  },
};
