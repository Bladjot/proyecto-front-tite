// FRONTEND - /src/db/services/userService.ts
import bcrypt from "bcryptjs";
import { isAxiosError } from "axios";
import { api } from "../config/api";
import { normaliseRut } from "../../utils/rut";
import { resolvePublicApiUrl } from "../../utils/media";
import { serializePreferencesValue } from "../../utils/preferences";

export type RawUser = {
  id?: string;
  _id?: string;
  name?: string;
  lastName?: string;
  email?: string;
  telefono?: string;
  rut?: string;
  phone?: string;
  photo?: string;
  bio?: string;
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

const resolveRutValue = (raw: RawUser): string => {
  const base = raw as Record<string, unknown>;

  const candidateValues: unknown[] = [
    base?.rut,
    base?.RUT,
    base?.Rut,
    base?.rutUsuario,
    base?.rut_user,
    base?.rutUser,
    base?.dni,
    base?.DNI,
    base?.documento,
    base?.documentNumber,
  ];

  // 👇 Busca rut en estructuras anidadas comunes
  const nestedSources = [
    (base?.perfil as Record<string, unknown>)?.rut,
    (base?.profile as Record<string, unknown>)?.rut,
    (base?.persona as Record<string, unknown>)?.rut,
    (base?.identificacion as Record<string, unknown>)?.rut,
    (base?.datosPersonales as Record<string, unknown>)?.rut,
  ];

  const allCandidates = [...candidateValues, ...nestedSources];

  for (const candidate of allCandidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) {
        return normaliseRut(trimmed);
      }
    }
    if (typeof candidate === "number") {
      return normaliseRut(String(candidate));
    }
  }

  return "";
};

export const mapUserRecord = (raw: RawUser): UserRecord => ({
  id: raw.id || raw._id || "",
  name: raw.name ?? "",
  lastName: raw.lastName ?? "",
  email: raw.email ?? "",
  rut: resolveRutValue(raw),
  roles: Array.isArray(raw.roles)
    ? raw.roles
        .map((role) => normaliseRoleValue(role))
        .filter(Boolean)
    : [],
  permisos: Array.isArray(raw.permisos) ? raw.permisos : [],
});

const persistStoredUserPhoto = (relativePhoto: string) => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    const updated = { ...parsed, photo: relativePhoto };
    localStorage.setItem("user", JSON.stringify(updated));
  } catch (error) {
    console.warn("[userService] No se pudo actualizar la foto en localStorage", error);
  }
};

const enrichProfileDetailsResponse = (payload: Record<string, unknown>) => {
  const responsePhoto = typeof (payload as any)?.foto === "string" ? String((payload as any).foto) : "";
  if (responsePhoto) {
    persistStoredUserPhoto(responsePhoto);
    return {
      ...payload,
      fotoUrl: resolvePublicApiUrl(responsePhoto),
    };
  }
  return payload;
};

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

  // Leer detalles de perfil (bio, preferencias) del usuario autenticado
  getProfileDetails: async () => {
    const response = await api.get<Record<string, unknown>>(
      "/auth/profile-details",
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Guardar detalles de perfil (nombre, apellido, biografía, preferencias) del usuario autenticado
  saveProfileDetails: async (details: {
    name?: string | null;
    lastName?: string | null;
    biografia?: string | null;
    bio?: string | null;
    preferencias?: unknown;
    preferences?: unknown;
    email?: string | null;
    telefono?: string | null;
    phone?: string | null;
    currentPassword?: string | null;
    newPassword?: string | null;
    foto?: File | Blob | null;
  }) => {
    const sanitizeField = (value?: string | null) => {
      if (value === undefined || value === null) return undefined;
      const stringValue = String(value);
      const trimmed = stringValue.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    };

    const formData = new FormData();
    let hasChanges = false;

    const appendIfPresent = (key: string, value?: string) => {
      if (value !== undefined) {
        formData.append(key, value);
        hasChanges = true;
      }
    };

    appendIfPresent("name", sanitizeField(details.name));
    appendIfPresent("lastName", sanitizeField(details.lastName));
    appendIfPresent("biografia", sanitizeField(details.biografia ?? details.bio));
    appendIfPresent("email", sanitizeField(details.email));
    appendIfPresent("telefono", sanitizeField(details.telefono ?? details.phone));

    const preferenciasValue = serializePreferencesValue(details.preferencias ?? details.preferences);
    appendIfPresent("preferencias", preferenciasValue);

    appendIfPresent("currentPassword", sanitizeField(details.currentPassword));
    appendIfPresent("newPassword", sanitizeField(details.newPassword));

    if (details.foto instanceof File || details.foto instanceof Blob) {
      formData.append("foto", details.foto);
      hasChanges = true;
    }

    if (!hasChanges) {
      throw new Error("No hay cambios para guardar en el perfil");
    }

    const response = await api.patch<Record<string, unknown>>("/auth/profile-details", formData, {
      headers: getAuthHeaders(),
    });
    return enrichProfileDetailsResponse(response.data || {});
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

  // Enviar solicitud de acreditación como vendedor
  createVendorAccreditation: async (payload: {
    nombre_tienda: string;
    telefono_contacto: string;
    rut_empresa: string;
  }) => {
    const response = await api.post(
      "/vendor-accreditations",
      {
        nombre_tienda: payload.nombre_tienda,
        telefono_contacto: payload.telefono_contacto,
        rut_empresa: payload.rut_empresa,
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Listar solicitudes de acreditación (solo admins)
  getVendorAccreditations: async () => {
    const response = await api.get("/vendor-accreditations", {
      headers: getAuthHeaders(),
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  // Eliminar solicitud de acreditación (solo admins)
  deleteVendorAccreditation: async (id: string) => {
    await api.delete(`/vendor-accreditations/${id}`, {
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
