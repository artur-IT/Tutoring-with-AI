// Types for Math Tutor Agent

// Student data structure from localStorage
export interface StudentData {
  subject: string;
  problem: string;
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
  metadata?: {
    tokens?: number;
    model?: string;
    duration?: number;
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
