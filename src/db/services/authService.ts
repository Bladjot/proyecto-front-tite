import { api } from "../config/api";
import { normaliseRoleValue } from "./userService";

export type RegisterPayload = {
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
  contrasena: string;
  recaptchaToken: string;
};

export type AuthUser = {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  rut?: string;
  telefono?: string;
  roles: string[];
  permisos: string[];
  activo?: boolean;
  foto?: string;
  creado_en?: string;
  actualizado_en?: string;
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

const mapUserFields = (rawUser: Record<string, unknown> & { id?: unknown; roles?: unknown; permisos?: unknown }): AuthUser => {
  const idCandidate = rawUser.id ?? (rawUser as Record<string, unknown>)._id ?? "";
  const id = typeof idCandidate === "string" ? idCandidate : String(idCandidate || "");
  const correo =
    typeof rawUser.correo === "string"
      ? rawUser.correo
      : typeof rawUser.email === "string"
        ? rawUser.email
        : "";
  const nombre =
    typeof rawUser.nombre === "string"
      ? rawUser.nombre
      : typeof rawUser.name === "string"
        ? rawUser.name
        : "";
  const apellido =
    typeof rawUser.apellido === "string"
      ? rawUser.apellido
      : typeof rawUser.lastName === "string"
        ? rawUser.lastName
        : "";
  const telefonoCandidate = typeof rawUser.telefono === "string" ? rawUser.telefono : rawUser.phone;
  const telefono = typeof telefonoCandidate === "string" ? telefonoCandidate : undefined;
  const rutCandidate = typeof rawUser.rut === "string" ? rawUser.rut : rawUser.dni;
  const rut = typeof rutCandidate === "string" ? rutCandidate : undefined;

  const roles = Array.isArray(rawUser.roles)
    ? rawUser.roles.map((role) => normaliseRoleValue(role)).filter(Boolean)
    : [];

  const permisosSource: unknown[] = Array.isArray(rawUser.permisos)
    ? rawUser.permisos
    : Array.isArray((rawUser as Record<string, unknown>).permissions)
      ? ((rawUser as Record<string, unknown>).permissions as unknown[])
      : [];
  const permisos = permisosSource.filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  const activo =
    typeof rawUser.activo === "boolean"
      ? rawUser.activo
      : typeof rawUser.isActive === "boolean"
        ? rawUser.isActive
        : undefined;

  const foto =
    typeof rawUser.foto === "string"
      ? rawUser.foto
      : typeof rawUser.photo === "string"
        ? rawUser.photo
        : undefined;

  const creado_en =
    typeof rawUser.creado_en === "string"
      ? rawUser.creado_en
      : typeof rawUser.createdAt === "string"
        ? rawUser.createdAt
        : undefined;

  const actualizado_en =
    typeof rawUser.actualizado_en === "string"
      ? rawUser.actualizado_en
      : typeof rawUser.updatedAt === "string"
        ? rawUser.updatedAt
        : undefined;

  return {
    id,
    correo,
    nombre,
    apellido,
    rut,
    telefono,
    roles,
    permisos,
    activo,
    foto,
    creado_en,
    actualizado_en,
  };
};

const normaliseAuthResponse = (data: AuthResponse): AuthResponse => {
  if (!data?.user) return data;

  return {
    ...data,
    user: mapUserFields({ ...data.user }),
  };
};

export const authService = {
  login: async (correo: string, contrasena: string, recaptchaToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(getAuthPath("/auth/login"), {
      correo,
      contrasena,
      recaptchaToken,
    });
    return normaliseAuthResponse(response.data);
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(getAuthPath("/auth/register"), payload);
    return normaliseAuthResponse(response.data);
  },

  resetPassword: async (correo: string) => {
    const response = await api.post(getAuthPath("/auth/forgot-password"), { correo });
    return response.data;
  },
};
