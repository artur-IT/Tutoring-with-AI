import type { APIRoute } from "astro";
import { getCurrentMonthUsage, getDaysUntilReset } from "../../lib/tokenUsage";

// Mark as server-rendered (required for API endpoints)
export const prerender = false;

/**
 * GET /api/token-status
 * Returns current token usage status and whether the app is blocked
 */
export const GET: APIRoute = async () => {
  try {
    const usage = await getCurrentMonthUsage();
    const daysUntilReset = getDaysUntilReset();

    // Calculate next month name in Polish
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleDateString("pl-PL", { month: "long" });

    return new Response(
      JSON.stringify({
        success: true,
        isBlocked: usage.isLimitReached,
        isWarning: usage.isWarning,
        usage: {
          totalTokens: usage.totalTokens,
          limit: usage.limit,
          percentUsed: usage.percentUsed,
          remaining: usage.remaining,
        },
        resetInfo: {
          daysUntilReset,
          nextMonth: nextMonthName,
        },
        message: usage.isLimitReached
          ? `Limit tokenów na ten miesiąc został wyczerpany. Wróć ${daysUntilReset === 1 ? "jutro" : `za ${daysUntilReset} dni`} (1. ${nextMonthName}).`
          : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ [API] Error checking token status:", error);

    return new Response(
      JSON.stringify({
        success: false,
        isBlocked: false,
        error: "Nie udało się sprawdzić statusu tokenów",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
