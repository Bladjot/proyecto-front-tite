const RUT_ALLOWED_INPUT_REGEX = /[^0-9kK.\-]/g;
const RUT_FORMAT_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[\dK]$/;

const cleanRut = (value: string): string => value.replace(/[^0-9kK]/g, "").toUpperCase();

export const sanitiseRutInput = (value: string): string => {
  if (typeof value !== "string") return "";
  return value.replace(RUT_ALLOWED_INPUT_REGEX, "").replace(/k/g, "K");
};

export const formatRut = (value: string): string => {
  const clean = cleanRut(value);
  if (clean.length <= 1) return clean;

  const digits = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const reversedDigits = digits.split("").reverse();
  const groups: string[] = [];

  for (let i = 0; i < reversedDigits.length; i += 3) {
    const chunk = reversedDigits.slice(i, i + 3).join("");
    groups.push(chunk.split("").reverse().join(""));
  }

  const formattedDigits = groups.reverse().join(".");
  return `${formattedDigits}-${dv}`;
};

export const isRutFormatValid = (value: string): boolean => RUT_FORMAT_REGEX.test(value.trim());

export const normaliseRut = (value: string): string => {
  if (typeof value !== "string") return "";
  const formatted = formatRut(value);
  if (!formatted.includes("-")) return "";
  return formatted.replace(/\./g, "");
};
