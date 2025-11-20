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
  nombre?: string;
  apellido?: string;
  correo?: string;
  contrasena?: string;
  telefono?: string;
  rut?: string;
  roles?: string[];
  permisos?: string[];
  permissions?: string[];
  activo?: boolean;
  foto?: string;
  creado_en?: string;
  actualizado_en?: string;
  // Legacy fallbacks
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  isActive?: boolean;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
};

export type UserRecord = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rut?: string;
  telefono?: string;
  roles: string[];
  permisos: string[];
  activo?: boolean;
  foto?: string;
  creado_en?: string;
  actualizado_en?: string;
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

export type RawVendorAccreditation = {
  id?: string;
  _id?: string;
  nombre_tienda?: string;
  telefono_contacto?: string;
  rut_empresa?: string;
  estado?: string;
  usuario_id?: string;
  storeName?: string;
  contactNumber?: string;
  companyRut?: string;
  status?: string;
  userId?: string;
  applicant?: {
    id?: string;
    _id?: string;
    nombre?: string;
    apellido?: string;
    name?: string;
    lastName?: string;
    correo?: string;
    email?: string;
  };
};

export type VendorAccreditationRecord = RawVendorAccreditation & {
  id?: string;
  userId?: string;
  storeName?: string;
  contactNumber?: string;
  companyRut?: string;
  status?: string;
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
  "contrasena",
  "password",
  "newPassword",
  "nuevaContrasena",
  "passwordConfirmation",
  "password_confirmation",
  "confirmPassword",
  "password_confirm",
  "contrasenaActual",
  "currentPassword",
  "new_password",
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

export const mapUserRecord = (raw: RawUser): UserRecord => {
  const idCandidate = raw.id ?? raw._id ?? "";
  const id = typeof idCandidate === "string" ? idCandidate : String(idCandidate || "");
  const nombre =
    typeof raw.nombre === "string"
      ? raw.nombre
      : typeof raw.name === "string"
        ? raw.name
        : "";
  const apellido =
    typeof raw.apellido === "string"
      ? raw.apellido
      : typeof raw.lastName === "string"
        ? raw.lastName
        : "";
  const correo =
    typeof raw.correo === "string"
      ? raw.correo
      : typeof raw.email === "string"
        ? raw.email
        : "";
  const telefono =
    typeof raw.telefono === "string"
      ? raw.telefono
      : typeof raw.phone === "string"
        ? raw.phone
        : undefined;

  const roles = Array.isArray(raw.roles)
    ? raw.roles.map((role) => normaliseRoleValue(role)).filter(Boolean)
    : [];

  const permisosSource = Array.isArray(raw.permisos)
    ? raw.permisos
    : Array.isArray(raw.permissions)
      ? raw.permissions
      : [];
  const permisos = permisosSource.filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  const activo =
    typeof raw.activo === "boolean"
      ? raw.activo
      : typeof raw.isActive === "boolean"
        ? raw.isActive
        : undefined;

  const foto =
    typeof raw.foto === "string"
      ? raw.foto
      : typeof raw.photo === "string"
        ? raw.photo
        : undefined;

  const creado_en = raw.creado_en ?? raw.createdAt;
  const actualizado_en = raw.actualizado_en ?? raw.updatedAt;

  return {
    id,
    nombre,
    apellido,
    correo,
    telefono,
    rut: resolveRutValue(raw),
    roles,
    permisos,
    activo,
    foto,
    creado_en,
    actualizado_en,
  };
};

const mapVendorAccreditation = (raw: RawVendorAccreditation): VendorAccreditationRecord => {
  const applicant = raw.applicant
    ? {
        ...raw.applicant,
        nombre:
          raw.applicant.nombre ??
          raw.applicant.name ??
          "",
        apellido:
          raw.applicant.apellido ??
          raw.applicant.lastName ??
          "",
        correo:
          raw.applicant.correo ??
          raw.applicant.email ??
          "",
      }
    : undefined;

  return {
    ...raw,
    id: raw.id || raw._id || raw.usuario_id || undefined,
    userId: raw.userId || raw.usuario_id,
    storeName: raw.storeName || raw.nombre_tienda,
    contactNumber: raw.contactNumber || raw.telefono_contacto,
    companyRut: raw.companyRut || raw.rut_empresa,
    status: raw.status || raw.estado || "pendiente",
    applicant,
  };
};

const persistStoredUserPhoto = (relativePhoto: string) => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    const updated = { ...parsed, foto: relativePhoto, photo: relativePhoto };
    localStorage.setItem("user", JSON.stringify(updated));
  } catch (error) {
    console.warn("[userService] No se pudo actualizar la foto en localStorage", error);
  }
};

const enrichProfileDetailsResponse = (payload: Record<string, unknown>) => {
  const fotoSource = (payload as any)?.foto ?? (payload as any)?.photo ?? "";
  const responsePhoto = typeof fotoSource === "string" ? String(fotoSource) : "";
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
    nombre?: string | null;
    name?: string | null;
    apellido?: string | null;
    lastName?: string | null;
    biografia?: string | null;
    bio?: string | null;
    preferencias?: unknown;
    preferences?: unknown;
    correo?: string | null;
    email?: string | null;
    telefono?: string | null;
    phone?: string | null;
    contrasenaActual?: string | null;
    currentPassword?: string | null;
    nuevaContrasena?: string | null;
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

    appendIfPresent("nombre", sanitizeField(details.nombre ?? details.name));
    appendIfPresent("apellido", sanitizeField(details.apellido ?? details.lastName));
    appendIfPresent("biografia", sanitizeField(details.biografia ?? details.bio));
    appendIfPresent("correo", sanitizeField(details.correo ?? details.email));
    appendIfPresent("telefono", sanitizeField(details.telefono ?? details.phone));

    const preferenciasValue = serializePreferencesValue(details.preferencias ?? details.preferences);
    appendIfPresent("preferencias", preferenciasValue);

    appendIfPresent("contrasenaActual", sanitizeField(details.contrasenaActual ?? details.currentPassword));
    appendIfPresent("nuevaContrasena", sanitizeField(details.nuevaContrasena ?? details.newPassword));

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
    rut_empresa?: string;
  }) => {
    const requestBody: Record<string, string> = {
      nombre_tienda: payload.nombre_tienda,
      telefono_contacto: payload.telefono_contacto,
    };

    if (payload.rut_empresa && payload.rut_empresa.trim().length > 0) {
      requestBody.rut_empresa = payload.rut_empresa.trim();
    }

    const response = await api.post(
      "/vendor-accreditations",
      requestBody,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Listar solicitudes de acreditación (solo admins)
  getVendorAccreditations: async (): Promise<VendorAccreditationRecord[]> => {
    const response = await api.get<RawVendorAccreditation[]>("/vendor-accreditations", {
      headers: getAuthHeaders(),
    });
    if (!Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((request) => mapVendorAccreditation(request));
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
    if (key !== "contrasena") {
      delete payload[key];
    }
  }

  if (passwordCandidate) {
    payload.contrasena = await bcrypt.hash(passwordCandidate, 10);
  } else if (typeof payload.contrasena === "string" && payload.contrasena.trim().length < 6) {
    delete payload.contrasena;
  }

  return payload;
};
