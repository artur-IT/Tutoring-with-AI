/**
 * Content Filter Utility
 * Provides functions for sanitizing and validating user input
 * to protect against XSS, profanity, and inappropriate content
 */

// Polish profanity blacklist
// This is a basic list - should be expanded based on requirements
const PROFANITY_BLACKLIST = [
  // Common vulgarities
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
  // Offensive terms
  "cipa",
  "pizda",
  "skurwysyn",
  "zjeb",
  "pedał",
  "ciota",
  // Variants with asterisks or special characters
  "k*rwa",
  "j*bać",
  "ch*j",
] as const;

// Patterns for prompt injection detection
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

// Patterns for detecting personal information
const PERSONAL_INFO_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}\b/i, // Phone numbers (PL format)
  /\b\d{9}\b/, // 9-digit numbers (could be phone)
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email addresses
  /\bhttps?:\/\/[^\s]+/i, // URLs
  /\b\d{2}-\d{3}\b/, // Postal codes
] as const;

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  sanitized?: string;
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses simple HTML escaping that works in both browser and Node.js
 */
export const sanitizeHTML = (input: string): string => {
  if (!input) return "";

  // Escape HTML special characters
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return escaped;
};

/**
 * Checks if text contains profanity from the blacklist
 */
export const containsProfanity = (text: string): boolean => {
  const normalizedText = text.toLowerCase().trim();

  // Check exact matches and word boundaries
  return PROFANITY_BLACKLIST.some((word) => {
    // Check for exact word match with word boundaries
    const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, "i");
    if (wordBoundaryRegex.test(normalizedText)) {
      return true;
    }

    // Check for variations with numbers or special chars replacing letters
    // Also use word boundaries to avoid false positives
    const fuzzyWord = word.replace(/a/g, "[a@4]").replace(/e/g, "[e3]").replace(/i/g, "[i1!]").replace(/o/g, "[o0]");
    const fuzzyRegex = new RegExp(`\\b${fuzzyWord}\\b`, "i");
    return fuzzyRegex.test(normalizedText);
  });
};

/**
 * Detects potential prompt injection attempts
 */
export const detectPromptInjection = (text: string): boolean => {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(text));
};

/**
 * Detects personal information in text
 */
export const containsPersonalInfo = (text: string): boolean => {
  return PERSONAL_INFO_PATTERNS.some((pattern) => pattern.test(text));
};

/**
 * Validates and sanitizes user input
 * Main function to use before processing user content
 */
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

  // Check if empty
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      error: "Wiadomość nie może być pusta",
    };
  }

  // Check length
  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `Wiadomość jest za długa (max ${maxLength} znaków)`,
    };
  }

  // Sanitize HTML first
  const sanitized = sanitizeHTML(input);

  // Check for profanity
  if (checkProfanity && containsProfanity(sanitized)) {
    return {
      isValid: false,
      error: "Twoja wiadomość zawiera niedozwolone słowa. Prosimy o uprzejmy język.",
    };
  }

  // Check for prompt injection
  if (checkPromptInjection && detectPromptInjection(sanitized)) {
    return {
      isValid: false,
      error: "Wykryto próbę manipulacji systemem. Prosimy o zadawanie normalnych pytań.",
    };
  }

  // Check for personal information
  if (checkPersonalInfo && containsPersonalInfo(sanitized)) {
    return {
      isValid: false,
      error: "Nie podawaj danych osobowych, takich jak numery telefonu, emaile czy adresy.",
    };
  }

  return {
    isValid: true,
    sanitized,
  };
};

/**
 * Quick sanitize for display purposes
 * Use this when displaying user content in the UI
 */
export const sanitizeForDisplay = (input: string): string => {
  return sanitizeHTML(input);
};

/**
 * Validates form input with appropriate length limits
 */
export const validateFormInput = (input: string, fieldName: string, maxLength: number): ValidationResult => {
  const result = validateAndSanitizeInput(input, {
    maxLength,
    checkProfanity: true,
    checkPromptInjection: false, // Less strict for form fields
    checkPersonalInfo: false, // Allow in form fields (like interests)
  });

  if (!result.isValid) {
    return result;
  }

  return {
    isValid: true,
    sanitized: result.sanitized,
  };
};
