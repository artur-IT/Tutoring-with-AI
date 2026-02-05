const PROFANITY_BLACKLIST = [
  "kurwa",
  "kurde",
  "kurna",
  "chuj",
  "chuja",
  "huj",
  "pierdol",
  "pierdolić",
  "jebać",
  "jebany",
  "wypierdalaj",
  "spierdal",
  "gówno",
  "srać",
  "dupa",
  "dupek",
  "cipa",
  "pizda",
  "skurwysyn",
  "zjeb",
  "pedał",
  "ciota",
  "k*rwa",
  "j*bać",
  "ch*j",
] as const;

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+previous/i,
  /ignore\s+all\s+previous/i,
  /forget\s+previous/i,
  /new\s+instructions/i,
  /system\s*:/i,
  /you\s+are\s+now/i,
  /act\s+as/i,
  /pretend\s+to\s+be/i,
  /disregard/i,
  /override/i,
] as const;

const PERSONAL_INFO_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}\b/i,
  /\b\d{9}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\bhttps?:\/\/[^\s]+/i,
  /\b\d{2}-\d{3}\b/,
] as const;

type ValidationResult = {
  isValid: boolean;
  error?: string;
  sanitized?: string;
};

export const sanitizeHTML = (input: string): string => {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

export const containsProfanity = (text: string): boolean => {
  const normalizedText = text.toLowerCase().trim();
  return PROFANITY_BLACKLIST.some((word) => {
    if (new RegExp(`\\b${word}\\b`, "i").test(normalizedText)) return true;
    const fuzzyWord = word.replace(/a/g, "[a@4]").replace(/e/g, "[e3]").replace(/i/g, "[i1!]").replace(/o/g, "[o0]");
    return new RegExp(`\\b${fuzzyWord}\\b`, "i").test(normalizedText);
  });
};

export const detectPromptInjection = (text: string): boolean =>
  PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(text));

export const containsPersonalInfo = (text: string): boolean =>
  PERSONAL_INFO_PATTERNS.some((pattern) => pattern.test(text));
export const validateAndSanitizeInput = (
  input: string,
  options: {
    maxLength?: number;
    checkProfanity?: boolean;
    checkPromptInjection?: boolean;
    checkPersonalInfo?: boolean;
  } = {}
): ValidationResult => {
  const { maxLength = 1000, checkProfanity = true, checkPromptInjection = true, checkPersonalInfo = true } = options;

  if (!input || input.trim().length === 0) {
    return { isValid: false, error: "Wiadomość nie może być pusta" };
  }

  if (input.length > maxLength) {
    return { isValid: false, error: `Wiadomość jest za długa (max ${maxLength} znaków)` };
  }

  const sanitized = sanitizeHTML(input);

  if (checkProfanity && containsProfanity(sanitized)) {
    return { isValid: false, error: "Twoja wiadomość zawiera niedozwolone słowa. Prosimy o uprzejmy język." };
  }

  if (checkPromptInjection && detectPromptInjection(sanitized)) {
    return { isValid: false, error: "Wykryto próbę manipulacji systemem. Prosimy o zadawanie normalnych pytań." };
  }

  if (checkPersonalInfo && containsPersonalInfo(sanitized)) {
    return { isValid: false, error: "Nie podawaj danych osobowych, takich jak numery telefonu, emaile czy adresy." };
  }

  return { isValid: true, sanitized };
};
export const validateFormInput = (input: string, fieldName: string, maxLength: number): ValidationResult => {
  const result = validateAndSanitizeInput(input, {
    maxLength,
    checkProfanity: true,
    checkPromptInjection: false,
    checkPersonalInfo: false,
  });

  if (!result.isValid) {
    return result.error ? { ...result, error: `${fieldName}: ${result.error}` } : result;
  }

  return { isValid: true, sanitized: result.sanitized };
};
