const DEFAULT_API_BASE = "http://localhost:3000/api";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_BASE;

export const resolvePublicApiUrl = (relativePath?: string | null): string => {
  if (!relativePath) return "";
  if (/^https?:\/\//i.test(relativePath)) return relativePath;

  const base = apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
  const normalizedRelative = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  try {
    return new URL(normalizedRelative, base).href;
  } catch (error) {
    console.warn("[media] No se pudo resolver la URL pública:", error);
    return normalizedRelative;
  }
};

