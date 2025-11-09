const TEXT_KEYS = ["notas", "nota", "texto", "text", "descripcion", "description"];

const isJsonLike = (value: unknown): value is Record<string, unknown> | unknown[] =>
  typeof value === "object" && value !== null;

const extractTextFromObject = (value: Record<string, unknown> | unknown[]): string | null => {
  if (Array.isArray(value)) {
    const flattened = value.find((item) => typeof item === "string");
    return typeof flattened === "string" ? flattened : null;
  }

  for (const key of TEXT_KEYS) {
    const candidate = value[key];
    if (typeof candidate === "string") {
      return candidate;
    }
  }

  return null;
};

export const parsePreferencesText = (rawValue: unknown): string => {
  if (!rawValue) return "";
  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    if (!trimmed) return "";
    try {
      const parsed = JSON.parse(trimmed);
      if (isJsonLike(parsed)) {
        const extracted = extractTextFromObject(parsed);
        if (extracted !== null) return extracted;
        if (!Array.isArray(parsed) && Object.keys(parsed).length === 0) return "";
        return JSON.stringify(parsed);
      }
    } catch {
      // Not JSON, fallback to raw
    }
    return trimmed;
  }

  if (isJsonLike(rawValue)) {
    const extracted = extractTextFromObject(rawValue);
    if (extracted !== null) return extracted;
    if (!Array.isArray(rawValue) && Object.keys(rawValue).length === 0) return "";
    return JSON.stringify(rawValue);
  }

  return "";
};

export const buildPreferencesObjectFromText = (
  text: string
): Record<string, unknown> | unknown[] | undefined => {
  if (typeof text !== "string") return undefined;
  const trimmed = text.trim();
  if (!trimmed) return {};
  try {
    const parsed = JSON.parse(trimmed);
    if (isJsonLike(parsed) || Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON, fallback below
  }
  return { notas: trimmed };
};

export const serializePreferencesValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed);
      if (isJsonLike(parsed) || Array.isArray(parsed)) {
        return JSON.stringify(parsed);
      }
    } catch {
      return JSON.stringify({ notas: trimmed });
    }
  }

  if (isJsonLike(value) || Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return undefined;
    }
  }

  return undefined;
};
