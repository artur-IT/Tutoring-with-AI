import type { APIRoute } from "astro";
import { getCurrentMonthUsage, getDaysUntilReset } from "../../lib/tokenUsage";

export const prerender = false;

const jsonResponse = (data: object, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

const getNextMonthName = () => {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toLocaleDateString("pl-PL", { month: "long" });
};

const getBlockedMessage = (daysUntilReset: number, nextMonthName: string) =>
  `Limit tokenów na ten miesiąc został wyczerpany. Wróć ${daysUntilReset === 1 ? "jutro" : `za ${daysUntilReset} dni`} (1. ${nextMonthName}).`;

// GET /api/token-status - returns current token usage status
export const GET: APIRoute = async () => {
  try {
    const usage = await getCurrentMonthUsage();
    const daysUntilReset = getDaysUntilReset();
    const nextMonthName = getNextMonthName();

    return jsonResponse({
      success: true,
      isBlocked: usage.isLimitReached,
      isWarning: usage.isWarning,
      usage: {
        totalTokens: usage.totalTokens,
        limit: usage.limit,
        percentUsed: usage.percentUsed,
        remaining: usage.remaining,
      },
      resetInfo: { daysUntilReset, nextMonth: nextMonthName },
      message: usage.isLimitReached ? getBlockedMessage(daysUntilReset, nextMonthName) : null,
    });
  } catch (error) {
    console.error("❌ [API] Error checking token status:", error);
    return jsonResponse({ success: false, isBlocked: false, error: "Nie udało się sprawdzić statusu tokenów" }, 500);
  }
};
