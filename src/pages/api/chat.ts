import type { APIRoute } from "astro";
import { sendMessage } from "../../agents/mathTutor";
import type { Message, StudentData } from "../../agents/mathTutor/types";
import { sessionLimits } from "../../agents/mathTutor/config";
import { validateAndSanitizeInput } from "../../lib/contentFilter";

export const prerender = false;

const sessionRequestCounts = new Map<string, { count: number; createdAt: number }>();
const ONE_HOUR_MS = 60 * 60 * 1000;

const cleanupOldSessions = () => {
  const oneHourAgo = Date.now() - ONE_HOUR_MS;
  sessionRequestCounts.forEach((data, sessionId) => {
    if (data.createdAt < oneHourAgo) sessionRequestCounts.delete(sessionId);
  });
};

const jsonResponse = (data: object, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

const errorResponse = (error: string, status = 400) => jsonResponse({ success: false, error }, status);
export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();

    if (!text) {
      console.warn("⚠️ [API] Empty request body");
      return errorResponse("Pusta treść żądania");
    }

    const { message, history, studentData, subject, sessionId } = JSON.parse(text);

    // Rate limiting
    if (sessionId) {
      cleanupOldSessions();
      const sessionData = sessionRequestCounts.get(sessionId);
      const requestCount = (sessionData?.count ?? 0) + 1;

      if (requestCount > sessionLimits.maxMessagesPerSession) {
        console.warn(`⚠️ [API] Limit zapytań przekroczony dla sesji ${sessionId}: ${requestCount}`);
        return jsonResponse(
          {
            success: false,
            error: "Osiągnięto limit zapytań dla tej sesji. Proszę rozpocząć nową sesję.",
            limitExceeded: true,
          },
          429
        );
      }

      sessionRequestCounts.set(sessionId, { count: requestCount, createdAt: sessionData?.createdAt ?? Date.now() });
    }

    if (!message || typeof message !== "string") {
      console.warn("⚠️ [API] Walidacja nie powiodła się: brak wiadomości");
      return errorResponse("Wiadomość jest wymagana");
    }

    const validation = validateAndSanitizeInput(message, {
      maxLength: 400,
      checkProfanity: true,
      checkPromptInjection: true,
      checkPersonalInfo: true,
    });

    if (!validation.isValid) {
      console.warn("⚠️ [API] Walidacja treści nie powiodła się:", validation.error);
      return errorResponse(validation.error ?? "Nieprawidłowa treść wiadomości");
    }

    const sanitizedMessage = validation.sanitized ?? message;

    if (subject && subject !== "matematyka") {
      console.warn("⚠️ [API] Walidacja nie powiodła się: nieprawidłowy przedmiot");
      return errorResponse("Obecnie obsługujemy tylko matematykę");
    }

    const response = await sendMessage(
      sanitizedMessage,
      history as Message[] | undefined,
      studentData as StudentData | undefined,
      sessionId as string | undefined
    );

    const sessionData = sessionId ? sessionRequestCounts.get(sessionId) : null;
    const remainingRequests = Math.max(0, sessionLimits.maxMessagesPerSession - (sessionData?.count ?? 0));

    return jsonResponse(
      { ...response, rateLimit: { remaining: remainingRequests, limit: sessionLimits.maxMessagesPerSession } },
      response.success ? 200 : 500
    );
  } catch (error) {
    console.error("❌ [API] Error:", error);
    return errorResponse("Wystąpił błąd serwera", 500);
  }
};
