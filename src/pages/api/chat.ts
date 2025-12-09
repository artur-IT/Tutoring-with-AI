import type { APIRoute } from "astro";
import { sendMessage } from "../../agents/mathTutor";
import type { Message, StudentData } from "../../agents/mathTutor/types";

// Mark as server-rendered (required for POST endpoints)
export const prerender = false;

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
    const { message, history, studentData, subject } = body;

    console.log("📥 [API] Otrzymano:");
    console.log("  - Message:", message);
    console.log("  - History length:", history?.length || 0);
    console.log("  - Student data:", studentData);
    console.log("  - Subject:", subject);

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
      metadata: response.metadata,
    });

    // Return response
    return new Response(JSON.stringify(response), {
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
