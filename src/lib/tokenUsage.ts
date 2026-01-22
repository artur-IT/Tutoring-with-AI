/**
 * Token Usage Tracking Service
 *
 * Tracks API token usage per month to monitor costs.
 * Currently uses in-memory storage with file backup.
 * Can be migrated to Supabase database later.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

// Usage data structure
interface TokenUsageEntry {
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  sessionId?: string;
}

interface MonthlyUsage {
  month: string; // Format: "2026-01"
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  requestCount: number;
  entries: TokenUsageEntry[];
  lastUpdated: number;
}

interface UsageData {
  months: Record<string, MonthlyUsage>;
}

// Configuration
const TOKEN_LIMIT_PER_MONTH = 950_000_000; // 950 million (buffer from 1 billion)
const WARNING_THRESHOLD = 0.8; // Show warning at 80%

// In-memory cache
let usageCache: UsageData | null = null;

// File path for persistence (in project root, can be gitignored)
const DATA_FILE = path.join(process.cwd(), "data", "token-usage.json");

/**
 * Get current month key in format "YYYY-MM"
 */
const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/**
 * Initialize empty usage data
 */
const createEmptyUsageData = (): UsageData => ({
  months: {},
});

/**
 * Create empty monthly usage
 */
const createEmptyMonthlyUsage = (month: string): MonthlyUsage => ({
  month,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalTokens: 0,
  requestCount: 0,
  entries: [],
  lastUpdated: Date.now(),
});

/**
 * Ensure data directory exists
 */
const ensureDataDirectory = async (): Promise<void> => {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

/**
 * Load usage data from file
 */
const loadUsageData = async (): Promise<UsageData> => {
  if (usageCache) {
    return usageCache;
  }

  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, "utf-8");
    usageCache = JSON.parse(data) as UsageData;
    return usageCache;
  } catch {
    // File doesn't exist or is invalid, create new data
    usageCache = createEmptyUsageData();
    return usageCache;
  }
};

/**
 * Save usage data to file
 */
const saveUsageData = async (data: UsageData): Promise<void> => {
  try {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    usageCache = data;
  } catch (error) {
    console.error("❌ [TokenUsage] Error saving usage data:", error);
  }
};

/**
 * Log token usage for a request
 */
export const logTokenUsage = async (params: {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  sessionId?: string;
}): Promise<void> => {
  const { inputTokens, outputTokens, totalTokens, model, sessionId } = params;
  const month = getCurrentMonth();

  const data = await loadUsageData();

  // Initialize month if needed
  if (!data.months[month]) {
    data.months[month] = createEmptyMonthlyUsage(month);
  }

  const monthData = data.months[month];

  // Add entry
  const entry: TokenUsageEntry = {
    timestamp: Date.now(),
    inputTokens,
    outputTokens,
    totalTokens,
    model,
    sessionId,
  };

  monthData.entries.push(entry);

  // Update totals
  monthData.totalInputTokens += inputTokens;
  monthData.totalOutputTokens += outputTokens;
  monthData.totalTokens += totalTokens;
  monthData.requestCount += 1;
  monthData.lastUpdated = Date.now();

  // Save to file
  await saveUsageData(data);

  const logMsg = `Logged: ${totalTokens} tokens (in: ${inputTokens}, out: ${outputTokens})`;
  const monthlyMsg = `Monthly: ${monthData.totalTokens.toLocaleString()} / ${TOKEN_LIMIT_PER_MONTH.toLocaleString()}`;
  console.log(`📊 [TokenUsage] ${logMsg}`);
  console.log(`📊 [TokenUsage] ${monthlyMsg}`);
};

/**
 * Get current month usage statistics
 */
export const getCurrentMonthUsage = async (): Promise<{
  month: string;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  requestCount: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  isWarning: boolean;
  isLimitReached: boolean;
}> => {
  const month = getCurrentMonth();
  const data = await loadUsageData();
  const monthData = data.months[month] || createEmptyMonthlyUsage(month);

  const remaining = Math.max(0, TOKEN_LIMIT_PER_MONTH - monthData.totalTokens);
  const percentUsed = (monthData.totalTokens / TOKEN_LIMIT_PER_MONTH) * 100;
  const isWarning = percentUsed >= WARNING_THRESHOLD * 100;
  const isLimitReached = monthData.totalTokens >= TOKEN_LIMIT_PER_MONTH;

  return {
    month,
    totalTokens: monthData.totalTokens,
    totalInputTokens: monthData.totalInputTokens,
    totalOutputTokens: monthData.totalOutputTokens,
    requestCount: monthData.requestCount,
    limit: TOKEN_LIMIT_PER_MONTH,
    remaining,
    percentUsed: Math.round(percentUsed * 100) / 100,
    isWarning,
    isLimitReached,
  };
};

/**
 * Check if monthly token limit is reached
 */
export const isMonthlyLimitReached = async (): Promise<boolean> => {
  const usage = await getCurrentMonthUsage();
  return usage.isLimitReached;
};

/**
 * Get days until month reset
 */
export const getDaysUntilReset = (): number => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format usage for display
 */
export const formatUsageMessage = async (): Promise<string> => {
  const usage = await getCurrentMonthUsage();
  const daysLeft = getDaysUntilReset();

  if (usage.isLimitReached) {
    return `Miesięczny limit tokenów został osiągnięty. Aplikacja wznowi działanie za ${daysLeft} dni (1. dnia nowego miesiąca).`;
  }

  if (usage.isWarning) {
    return `Uwaga: Wykorzystano ${usage.percentUsed.toFixed(1)}% miesięcznego limitu tokenów. Pozostało ${usage.remaining.toLocaleString()} tokenów.`;
  }

  return `Wykorzystano ${usage.percentUsed.toFixed(1)}% miesięcznego limitu (${usage.totalTokens.toLocaleString()} / ${usage.limit.toLocaleString()} tokenów).`;
};

// Export configuration for external use
export const TOKEN_CONFIG = {
  LIMIT_PER_MONTH: TOKEN_LIMIT_PER_MONTH,
  WARNING_THRESHOLD,
};
