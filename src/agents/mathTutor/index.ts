import { Mistral } from "@mistralai/mistralai";
import { mathTutorConfig, contentRestrictions } from "./config";
import { getSystemPrompt } from "./prompts";
import type { Message, AIResponse, StudentData } from "./types";
import { validateAndSanitizeInput } from "../../lib/contentFilter";
import { logTokenUsage, isMonthlyLimitReached, getCurrentMonthUsage, getDaysUntilReset } from "../../lib/tokenUsage";

const getMistralClient = () => {
  const apiKey = import.meta.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY environment variable is not set");
  return new Mistral({ apiKey });
};

const chatMessageValidationOptions = {
  maxLength: contentRestrictions.maxMessageLength,
  checkProfanity: true,
  checkPromptInjection: true,
  checkPersonalInfo: true,
} as const;
const TOPIC_MISMATCH_PHRASES = [
  "rozmowa zostaje zakończona",
  "rozmowa jest zakończona",
  "wróć do formularza",
  "wybierz właściwy temat",
  "nie pasuje do wybranego tematu",
  "musisz wrócić",
  "musisz wrócić do formularza",
] as const;

const CONTEXT_KEYWORDS = ["rozmowa", "konwersacja", "wróć", "formularz", "temat"] as const;

const checkIfTopicMismatch = (response: string): boolean => {
  const lowerResponse = response.toLowerCase();
  const matchedPhrase = TOPIC_MISMATCH_PHRASES.find((phrase) => lowerResponse.includes(phrase));
  if (matchedPhrase) return true;
  if (lowerResponse.includes("zakończona") && CONTEXT_KEYWORDS.some((kw) => lowerResponse.includes(kw))) return true;
  return false;
};

const formatHistory = (history: Message[], studentData?: StudentData): Message[] => [
  { role: "system", content: getSystemPrompt(studentData) },
  ...history.slice(-contentRestrictions.maxHistoryMessages),
];
export const sendMessage = async (
  userMessage: string,
  history: Message[] = [],
  studentData?: StudentData,
  sessionId?: string
): Promise<AIResponse> => {
  const startTime = Date.now();

  try {
    const limitReached = await isMonthlyLimitReached();
    if (limitReached) {
      const daysLeft = getDaysUntilReset();
      console.warn("⚠️ [MathTutor] Miesięczny limit tokenów osiągnięty!");
      return {
        success: false,
        error: `Miesięczny limit tokenów został osiągnięty. Aplikacja wznowi działanie za ${daysLeft} dni (1. dnia nowego miesiąca).`,
        limitExceeded: true,
      };
    }

    const validation = validateAndSanitizeInput(userMessage, chatMessageValidationOptions);
    if (!validation.isValid) {
      console.warn("⚠️ [MathTutor] Walidacja nie powiodła się:", validation.error);
      return {
        success: false,
        error: validation.error ?? "Nieprawidłowa treść wiadomości",
      };
    }

    const safeContent = validation.sanitized ?? userMessage;
    const userMsg: Message = {
      role: "user",
      content: safeContent,
      timestamp: Date.now(),
    };

    const messages = formatHistory([...history, userMsg], studentData);
    const client = getMistralClient();
    const { model, temperature, maxTokens } = mathTutorConfig;

    const chatResponse = await client.chat.complete({
      model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      temperature,
      maxTokens,
    });

    const aiMessage = chatResponse.choices?.[0]?.message?.content;

    if (!aiMessage) {
      console.error("❌ [MathTutor] Brak treści w odpowiedzi AI");
      return {
        success: false,
        error: "Nie otrzymano odpowiedzi od AI",
      };
    }

    const duration = Date.now() - startTime;

    const responseText = typeof aiMessage === "string" ? aiMessage : JSON.stringify(aiMessage);
    const shouldRedirect = checkIfTopicMismatch(responseText);

    const inputTokens = chatResponse.usage?.promptTokens ?? 0;
    const outputTokens = chatResponse.usage?.completionTokens ?? 0;
    const totalTokens = chatResponse.usage?.totalTokens ?? 0;

    await logTokenUsage({ inputTokens, outputTokens, totalTokens, model, sessionId });
    const usageStats = await getCurrentMonthUsage();

    return {
      success: true,
      response: responseText,
      shouldRedirect,
      metadata: { model, tokens: totalTokens, inputTokens, outputTokens, duration },
      tokenUsage: {
        monthlyTotal: usageStats.totalTokens,
        monthlyLimit: usageStats.limit,
        percentUsed: usageStats.percentUsed,
        isWarning: usageStats.isWarning,
      },
    };
  } catch (error) {
    console.error("❌ [MathTutor] Error calling Mistral API:", error);
    if (error instanceof Error) console.error("❌ [MathTutor] Error:", error.message, error.stack);

    const errorMsg =
      error instanceof Error ? `Wystąpił błąd: ${error.message}` : "Wystąpił nieznany błąd podczas łączenia z AI";
    return { success: false, error: errorMsg };
  }
};
