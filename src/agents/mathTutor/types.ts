// Types for Math Tutor Agent

export interface StudentData {
  subject: string;
  topic: string;
  problem: string;
  interests: string;
  avatar?: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  tokensUsed: number;
  createdAt: number;
  lastMessageAt: number;
  avatar?: string;
  topic?: string;
}

export interface ChatHistory {
  sessions: ChatSession[];
  currentSessionId: string | null;
}

export interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  shouldRedirect?: boolean;
  limitExceeded?: boolean;
  metadata?: {
    tokens?: number;
    inputTokens?: number;
    outputTokens?: number;
    model?: string;
    duration?: number;
  };
  rateLimit?: {
    remaining: number;
    limit: number;
  };
  tokenUsage?: {
    monthlyTotal: number;
    monthlyLimit: number;
    percentUsed: number;
    isWarning: boolean;
  };
}

export interface AgentConfig {
  name: string;
  subject: string;
  model: string;
  temperature: number;
  maxTokens: number;
  description: string;
}
