import { Mistral } from "@mistralai/mistralai";
import { mathTutorConfig, contentRestrictions } from "./config";
import { getSystemPrompt } from "./prompts";
import type { Message, AIResponse, StudentData } from "./types";
import { logTokenUsage, isMonthlyLimitReached, getCurrentMonthUsage, getDaysUntilReset } from "../../lib/tokenUsage";

const getMistralClient = (): Mistral => {
  const apiKey = import.meta.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY environment variable is not set");
  return new Mistral({ apiKey });
};

const validateMessage = (message: string): { valid: boolean; error?: string } => {
  if (!message?.trim()) return { valid: false, error: "Wiadomość nie może być pusta" };
  if (message.length > contentRestrictions.maxMessageLength) {
    return { valid: false, error: `Wiadomość jest za długa (max ${contentRestrictions.maxMessageLength} znaków)` };
  }
  return { valid: true };
};

// Topic mismatch detection - conversation end phrases
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
  console.log("🔍 [MathTutor] Sprawdzam odpowiedź pod kątem zakończenia rozmowy...");
  console.log("🔍 [MathTutor] Odpowiedź (pierwsze 200 znaków):", response.substring(0, 200));

  const lowerResponse = response.toLowerCase();

  const matchedPhrase = TOPIC_MISMATCH_PHRASES.find((phrase) => lowerResponse.includes(phrase));
  if (matchedPhrase) {
    console.log(`✅ [MathTutor] Wykryto dokładną frazę: "${matchedPhrase}"`);
    return true;
  }

  if (lowerResponse.includes("zakończona") && CONTEXT_KEYWORDS.some((kw) => lowerResponse.includes(kw))) {
    console.log("✅ [MathTutor] Wykryto 'zakończona' z kontekstem zakończenia rozmowy");
    return true;
  }

  console.log("ℹ️ [MathTutor] Brak wykrycia zakończenia rozmowy w odpowiedzi");
  return false;
};

const formatHistory = (history: Message[], studentData?: StudentData): Message[] => {
  const systemMessage: Message = { role: "system", content: getSystemPrompt(studentData) };
  const recentMessages = history.slice(-contentRestrictions.maxHistoryMessages);
  return [systemMessage, ...recentMessages];
};

// Main function - send message to Mistral AI
export const sendMessage = async (
  userMessage: string,
  history: Message[] = [],
  studentData?: StudentData,
  sessionId?: string
): Promise<AIResponse> => {
  console.log("\n🔵 [MathTutor] === Wywołanie sendMessage ===");
  console.log("📝 [MathTutor] User message:", userMessage);
  console.log("📚 [MathTutor] History length:", history.length);
  console.log("👤 [MathTutor] Student data:", studentData);

  const startTime = Date.now();

  try {
    // Check monthly token limit
    console.log("🔍 [MathTutor] Sprawdzanie limitu tokenów...");
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
    console.log("✅ [MathTutor] Limit tokenów OK");

    // Validate user message
    console.log("🔍 [MathTutor] Walidacja wiadomości...");
    const validation = validateMessage(userMessage);
    if (!validation.valid) {
      console.warn("⚠️ [MathTutor] Walidacja nie powiodła się:", validation.error);
      return {
        success: false,
        error: validation.error,
      };
    }
    console.log("✅ [MathTutor] Walidacja OK");

    console.log("ℹ️ [MathTutor] Sprawdzanie słów kluczowych wyłączone - system prompt trzyma temat");

    const userMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    console.log("📝 [MathTutor] Formatowanie historii dla API...");
    const messages = formatHistory([...history, userMsg], studentData);
    console.log("📋 [MathTutor] Sformatowano", messages.length, "wiadomości (w tym system prompt)");

    console.log("🔌 [MathTutor] Inicjalizacja klienta Mistral...");
    const client = getMistralClient();
    console.log("✅ [MathTutor] Klient zainicjalizowany");

    console.log("🚀 [MathTutor] Wywołuję Mistral API...");
    const { model, temperature, maxTokens } = mathTutorConfig;
    console.log("⚙️ [MathTutor] Config:", { model, temperature, maxTokens });

    const chatResponse = await client.chat.complete({
      model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      temperature,
      maxTokens,
    });

    console.log("📡 [MathTutor] Otrzymano odpowiedź z Mistral API");

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

    console.log("✅ [MathTutor] Sukces!");
    console.log("⏱️ [MathTutor] Czas:", duration, "ms");
    console.log("🎫 [MathTutor] Tokeny:", totalTokens, `(in: ${inputTokens}, out: ${outputTokens})`);
    console.log("📊 [MathTutor] Miesięczne zużycie:", `${usageStats.percentUsed.toFixed(2)}%`);
    console.log("💬 [MathTutor] Odpowiedź (preview):", responseText.substring(0, 100) + "...");
    if (shouldRedirect) {
      console.log("🔄 [MathTutor] Wykryto niezgodność tematu - przekierowanie do wyboru tematu");
    }

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
