// Types for Math Tutor Agent

// Student data structure from localStorage
export interface StudentData {
  subject: string;
  problem: string;
  interests: string;
}

// Single message in conversation
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

// Chat history structure
export interface ChatHistory {
  messages: Message[];
  studentData?: StudentData;
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
