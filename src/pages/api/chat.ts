import type { APIRoute } from "astro";
import { sendMessage } from "../../agents/mathTutor";
import type { Message, StudentData } from "../../agents/mathTutor/types";
import { sessionLimits } from "../../agents/mathTutor/config";

// Mark as server-rendered (required for POST endpoints)
export const prerender = false;

// In-memory store for rate limiting (sessionId -> request count)
// In production, consider using Redis or a database
const sessionRequestCounts = new Map<string, { count: number; createdAt: number }>();

// Clean up old sessions (older than 1 hour)
const cleanupOldSessions = () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [sessionId, data] of sessionRequestCounts.entries()) {
    if (data.createdAt < oneHourAgo) {
      sessionRequestCounts.delete(sessionId);
    }
  }
};

// POST /api/chat
// Handles chat requests from frontend
export const POST: APIRoute = async ({ request }) => {
  console.log("\n🟢 [API] === Nowe żądanie do /api/chat ===");
  try {
    // Parse request body
    const text = await request.text();
    console.log("📥 [API] Raw body:", text);

    if (!text) {
      console.warn("⚠️ [API] Empty request body");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Pusta treść żądania",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = JSON.parse(text);
    const { message, history, studentData, subject, sessionId } = body;

    console.log("📥 [API] Otrzymano:");
    console.log("  - Message:", message);
    console.log("  - History length:", history?.length || 0);
    console.log("  - Student data:", studentData);
    console.log("  - Subject:", subject);
    console.log("  - Session ID:", sessionId);

    // Rate limiting: check request count per session
    if (sessionId) {
      cleanupOldSessions();
      const sessionData = sessionRequestCounts.get(sessionId);
      const requestCount = sessionData ? sessionData.count + 1 : 1;

      if (requestCount > sessionLimits.maxMessagesPerSession) {
        console.warn(`⚠️ [API] Limit zapytań przekroczony dla sesji ${sessionId}: ${requestCount}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Osiągnięto limit zapytań dla tej sesji. Proszę rozpocząć nową sesję.",
            limitExceeded: true,
          }),
          {
            status: 429, // Too Many Requests
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Update request count
      sessionRequestCounts.set(sessionId, {
        count: requestCount,
        createdAt: sessionData?.createdAt || Date.now(),
      });

      console.log(
        `📊 [API] Liczba zapytań dla sesji ${sessionId}: ${requestCount}/${sessionLimits.maxMessagesPerSession}`
      );
    }

    // Validate required fields
    if (!message || typeof message !== "string") {
      console.warn("⚠️ [API] Walidacja nie powiodła się: brak wiadomości");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Wiadomość jest wymagana",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate subject (currently only math is supported)
    if (subject && subject !== "matematyka") {
      console.warn("⚠️ [API] Walidacja nie powiodła się: nieprawidłowy przedmiot");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Obecnie obsługujemy tylko matematykę",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ [API] Walidacja przeszła, wywołuję mathTutor...");

    // Call math tutor agent
    const response = await sendMessage(
      message,
      history as Message[] | undefined,
      studentData as StudentData | undefined
    );

    console.log("📤 [API] Odpowiedź z mathTutor:", {
      success: response.success,
      hasResponse: !!response.response,
      error: response.error,
      shouldRedirect: response.shouldRedirect,
      metadata: response.metadata,
    });

    // Add rate limiting info to response
    let remainingRequests = sessionLimits.maxMessagesPerSession;
    if (sessionId) {
      const sessionData = sessionRequestCounts.get(sessionId);
      if (sessionData) {
        remainingRequests = Math.max(0, sessionLimits.maxMessagesPerSession - sessionData.count);
      }
    }

    const responseWithRateLimit = {
      ...response,
      rateLimit: {
        remaining: remainingRequests,
        limit: sessionLimits.maxMessagesPerSession,
      },
    };

    // Return response
    return new Response(JSON.stringify(responseWithRateLimit), {
      status: response.success ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ [API] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił błąd serwera",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
