// FRONTEND - /proyecto-front-tite-master/src/db/config/api.ts
import axios from "axios";

const DEFAULT_API_BASE = "http://localhost:3000/api";

const normaliseBaseUrl = (url: string) => url.replace(/\/+$/, "");

const resolvedBaseUrl = (() => {
  const rawEnvUrl = import.meta.env.VITE_API_URL?.trim();

  if (!rawEnvUrl) {
    console.warn(
      `[api] VITE_API_URL no está definido. Se utilizará el valor por defecto ${DEFAULT_API_BASE}`
    );
    return normaliseBaseUrl(DEFAULT_API_BASE);
  }

  return normaliseBaseUrl(rawEnvUrl);
})();

const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

console.info("[api] API_URL:", api.defaults.baseURL);

export { api };
