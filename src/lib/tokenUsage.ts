// Token Usage Tracking Service - tracks API token usage per month
import { promises as fs } from "node:fs";
import path from "node:path";

interface TokenUsageEntry {
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  sessionId?: string;
}

interface MonthlyUsage {
  month: string;
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
const TOKEN_LIMIT_PER_MONTH = 950_000_000;
const WARNING_THRESHOLD = 0.8;

let usageCache: UsageData | null = null;
const DATA_FILE = path.join(process.cwd(), "data", "token-usage.json");

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const createEmptyUsageData = (): UsageData => ({ months: {} });

const createEmptyMonthlyUsage = (month: string): MonthlyUsage => ({
  month,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalTokens: 0,
  requestCount: 0,
  entries: [],
  lastUpdated: Date.now(),
});

const ensureDataDirectory = async (): Promise<void> => {
  const dir = path.dirname(DATA_FILE);
  await fs.access(dir).catch(() => fs.mkdir(dir, { recursive: true }));
};

const loadUsageData = async (): Promise<UsageData> => {
  if (usageCache) return usageCache;

  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, "utf-8");
    usageCache = JSON.parse(data) as UsageData;
    return usageCache;
  } catch {
    usageCache = createEmptyUsageData();
    return usageCache;
  }
};

const saveUsageData = async (data: UsageData): Promise<void> => {
  try {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    usageCache = data;
  } catch (error) {
    console.error("❌ [TokenUsage] Error saving usage data:", error);
  }
};

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

  data.months[month] ??= createEmptyMonthlyUsage(month);
  const monthData = data.months[month];

  monthData.entries.push({ timestamp: Date.now(), inputTokens, outputTokens, totalTokens, model, sessionId });
  monthData.totalInputTokens += inputTokens;
  monthData.totalOutputTokens += outputTokens;
  monthData.totalTokens += totalTokens;
  monthData.requestCount += 1;
  monthData.lastUpdated = Date.now();

  await saveUsageData(data);

  console.log(`📊 [TokenUsage] Logged: ${totalTokens} tokens (in: ${inputTokens}, out: ${outputTokens})`);
  console.log(
    `📊 [TokenUsage] Monthly: ${monthData.totalTokens.toLocaleString()} / ${TOKEN_LIMIT_PER_MONTH.toLocaleString()}`
  );
};

export const getCurrentMonthUsage = async () => {
  const month = getCurrentMonth();
  const data = await loadUsageData();
  const monthData = data.months[month] ?? createEmptyMonthlyUsage(month);

  const remaining = Math.max(0, TOKEN_LIMIT_PER_MONTH - monthData.totalTokens);
  const percentUsed = (monthData.totalTokens / TOKEN_LIMIT_PER_MONTH) * 100;

  return {
    month,
    totalTokens: monthData.totalTokens,
    totalInputTokens: monthData.totalInputTokens,
    totalOutputTokens: monthData.totalOutputTokens,
    requestCount: monthData.requestCount,
    limit: TOKEN_LIMIT_PER_MONTH,
    remaining,
    percentUsed: Math.round(percentUsed * 100) / 100,
    isWarning: percentUsed >= WARNING_THRESHOLD * 100,
    isLimitReached: monthData.totalTokens >= TOKEN_LIMIT_PER_MONTH,
  };
};

export const isMonthlyLimitReached = async (): Promise<boolean> => (await getCurrentMonthUsage()).isLimitReached;

export const getDaysUntilReset = (): number => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

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

export const TOKEN_CONFIG = { LIMIT_PER_MONTH: TOKEN_LIMIT_PER_MONTH, WARNING_THRESHOLD } as const;
