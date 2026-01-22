// Types for Math Tutor Agent

// Student data structure from localStorage
export interface StudentData {
  subject: string;
  topic: string; // Selected topic from predefined list (e.g., "Równania i nierówności")
  problem: string; // Detailed problem description (required)
  interests: string;
  avatar?: string; // User's chosen emoji avatar
}

// Single message in conversation
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

// Chat session (single conversation)
export interface ChatSession {
  id: string;
  name: string; // e.g., "2025-12-09 17:45"
  messages: Message[];
  tokensUsed: number;
  createdAt: number;
  lastMessageAt: number;
  avatar?: string; // User's chosen emoji avatar for this session
  topic?: string; // Selected topic from predefined list (e.g., "Równania i nierówności")
}

// All chat sessions
export interface ChatHistory {
  sessions: ChatSession[];
  currentSessionId: string | null;
}

// Response from Mistral API
export interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  shouldRedirect?: boolean; // If true, redirect user to topic selection
  limitExceeded?: boolean; // If true, rate limit was exceeded
  metadata?: {
    tokens?: number;
    inputTokens?: number;
    outputTokens?: number;
    model?: string;
    duration?: number;
  };
  rateLimit?: {
    remaining: number; // Number of remaining requests in this session
    limit: number; // Maximum number of requests per session
  };
  tokenUsage?: {
    monthlyTotal: number; // Total tokens used this month
    monthlyLimit: number; // Monthly token limit
    percentUsed: number; // Percentage of limit used
    isWarning: boolean; // True if approaching limit (80%+)
  };
}

// Agent configuration structure
export interface AgentConfig {
  name: string;
  subject: string;
  model: string;
  temperature: number;
  maxTokens: number;
  description: string;
}
