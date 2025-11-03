// FRONTEND - /src/db/services/userService.ts
import bcrypt from "bcryptjs";
import { isAxiosError } from "axios";
import { api } from "../config/api";

export type RawUser = {
  id?: string;
  _id?: string;
  name?: string;
  lastName?: string;
  email?: string;
  rut?: string;
  roles?: string[];
  permisos?: string[];
};

export type UserRecord = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  rut?: string;
  roles: string[];
  permisos?: string[];
};

export type RawRole = {
  id?: string;
  _id?: string;
  name?: string;
  displayName?: string;
  description?: string;
  slug?: string;
  key?: string;
  value?: string;
};

export type RoleRecord = {
  id: string;
  value: string;
  label: string;
};

const ROLE_CANONICAL_MAP: Record<string, string> = {
  usuario: "cliente",
  user: "cliente",
};

export const normaliseRoleValue = (role: unknown): string => {
  if (typeof role !== "string") return "";
  const trimmed = role.trim().toLowerCase();
  if (!trimmed) return "";
  return ROLE_CANONICAL_MAP[trimmed] || trimmed;
};

const PASSWORD_KEYS = [
  "password",
  "newPassword",
  "passwordConfirmation",
  "password_confirmation",
  "confirmPassword",
  "password_confirm",
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token guardado");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const mapUserRecord = (raw: RawUser): UserRecord => ({
  id: raw.id || raw._id || "",
  name: raw.name ?? "",
  lastName: raw.lastName ?? "",
  email: raw.email ?? "",
  rut: raw.rut ?? "",
  roles: Array.isArray(raw.roles)
    ? raw.roles
        .map((role) => normaliseRoleValue(role))
        .filter(Boolean)
    : [],
  permisos: Array.isArray(raw.permisos) ? raw.permisos : [],
});

export const userService = {
  // Crear usuario (registro normal o por admin)
  createUser: async (userData: Record<string, unknown>) => {
    const payload = await sanitizeUserPayload(userData);

    const response = await api.post<RawUser>("/users", payload, {
      headers: getAuthHeaders(),
    });
    return mapUserRecord(response.data);
  },

  // Obtener perfil del usuario logueado
  getProfile: async () => {
    const response = await api.get<RawUser>("/auth/me", {
      headers: getAuthHeaders(),
    });

    return response.data;
  },

  // Actualizar perfil del usuario
  updateUser: async (id: string, updateData: Record<string, unknown>) => {
    const payload = await sanitizeUserPayload(updateData);

    try {
      const response = await api.patch<RawUser>(`/users/${id}`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response &&
        [404, 405].includes(error.response.status)
      ) {
        const response = await api.put<RawUser>(`/users/${id}`, payload, {
          headers: getAuthHeaders(),
        });
        return response.data;
      }
      throw error;
    }
  },

  // Listar todos los usuarios (solo admins)
  getUsers: async () => {
    const response = await api.get<RawUser[]>("/users", {
      headers: getAuthHeaders(),
    });
    return Array.isArray(response.data) ? response.data.map(mapUserRecord) : [];
  },

  // Eliminar usuario (solo admins)
  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  // Obtener catálogo de roles disponibles
  getRoles: async () => {
    const response = await api.get<RawRole[]>("/roles", {
      headers: getAuthHeaders(),
    });

    if (!Array.isArray(response.data)) {
      return [] as RoleRecord[];
    }

    return response.data
      .map((role): RoleRecord | null => {
        const rawValue =
          role.slug ||
          role.key ||
          role.value ||
          (typeof role.name === "string" ? role.name : "");
        const valueCandidate = normaliseRoleValue(rawValue);
        const labelCandidate =
          role.displayName ||
          role.name ||
          role.slug ||
          role.key ||
          role.value ||
          null;

        if (!valueCandidate || !labelCandidate) return null;

        return {
          id: role.id || role._id || valueCandidate,
          value: valueCandidate.toLowerCase(),
          label: String(labelCandidate),
        };
      })
      .filter((role): role is RoleRecord => Boolean(role));
  },
};

const sanitizeUserPayload = async (rawData: Record<string, unknown>) => {
  const payload: Record<string, unknown> = { ...rawData };
  let passwordCandidate: string | null = null;

  for (const key of PASSWORD_KEYS) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length >= 6) {
      passwordCandidate = value.trim();
    }
    if (key !== "password") {
      delete payload[key];
    }
  }

  if (passwordCandidate) {
    payload.password = await bcrypt.hash(passwordCandidate, 10);
  } else if (typeof payload.password === "string" && payload.password.trim().length < 6) {
    delete payload.password;
  }

  return payload;
};
