import type { AuthUser } from "../db/services/authService";
import { normaliseRoleValue } from "../db/services/userService";

export const DASHBOARD_ROUTE = "/dashboard";
export const ADMIN_ROUTE = "/admin";

const normaliseRedirectPath = (redirectTo?: string | null): string | null => {
  if (typeof redirectTo !== "string") return null;
  const trimmed = redirectTo.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normaliseRoles = (rolesSource?: unknown): string[] => {
  if (!Array.isArray(rolesSource)) return [];
  return rolesSource
    .map((role) => normaliseRoleValue(role))
    .filter((role): role is string => Boolean(role));
};

export const safeParseStoredUser = (): AuthUser | null => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    return JSON.parse(rawUser) as AuthUser;
  } catch (error) {
    console.warn("[auth] No se pudo parsear el usuario almacenado", error);
    return null;
  }
};

export const getStoredUserRoles = (): string[] => {
  const storedUser = safeParseStoredUser();
  return normaliseRoles(storedUser?.roles);
};

export const resolvePostAuthRedirect = (
  redirectTo?: string | null,
  rolesSource?: unknown
): string => {
  const fallback = DASHBOARD_ROUTE;
  const normalisedRedirect = normaliseRedirectPath(redirectTo);
  const roles = normaliseRoles(rolesSource);
  const isAdmin = roles.includes("admin");

  if (isAdmin && (!normalisedRedirect || normalisedRedirect === ADMIN_ROUTE)) {
    return fallback;
  }

  return normalisedRedirect ?? fallback;
};

export const userHasRole = (role: string, rolesSource?: unknown): boolean => {
  const roles = normaliseRoles(rolesSource);
  return roles.includes(role.trim().toLowerCase());
};
