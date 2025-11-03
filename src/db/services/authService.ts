import { api } from "../config/api";
import { normaliseRoleValue } from "./userService";

export type RegisterPayload = {
  name: string;
  lastName: string;
  rut: string;
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  lastName: string;
  rut?: string;
  roles: string[];
  permisos?: string[];
};

export type AuthResponse = {
  user: AuthUser;
  access_token: string;
  redirectTo?: string;
};

const getAuthPath = (resource: string) => {
  const baseURL = (api.defaults.baseURL || "").replace(/\/+$/, "");
  const needsApiPrefix = !/\/api$/i.test(baseURL);
  return needsApiPrefix ? `/api${resource}` : resource;
};

const normaliseAuthResponse = (data: AuthResponse): AuthResponse => {
  if (!data?.user) return data;
  const roles = Array.isArray(data.user.roles)
    ? data.user.roles.map((role) => normaliseRoleValue(role)).filter(Boolean)
    : [];
  const permisos = Array.isArray(data.user.permisos) ? data.user.permisos : [];

  return {
    ...data,
    user: {
      ...data.user,
      roles,
      permisos,
    },
  };
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(getAuthPath("/auth/login"), {
      email,
      password,
    });
    return normaliseAuthResponse(response.data);
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(getAuthPath("/auth/register"), payload);
    return normaliseAuthResponse(response.data);
  },

  resetPassword: async (email: string) => {
    const response = await api.post(getAuthPath("/auth/forgot-password"), { email });
    return response.data;
  },
};
