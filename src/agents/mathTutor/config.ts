import type { AgentConfig } from "./types";

// Agent configuration - Math Tutor for teenagers (13-19)
export const mathTutorConfig: AgentConfig = {
  name: "Matematyczny Korepetytor",
  subject: "matematyka",
  model: "mistral-small-latest",
  temperature: 0.7,
  maxTokens: 800,
  description: "Przyjazny korepetytor matematyki dla nastolatków, wyjaśniający trudne zagadnienia w prosty sposób.",
};

// Safety and content restrictions
export const contentRestrictions = {
  maxMessageLength: 400,
  maxHistoryMessages: 20,
  apiTimeout: 30_000,
  targetAgeRange: { min: 13, max: 19 },
} as const;

// Session limits
export const sessionLimits = {
  maxSessionDuration: 45,
  maxMessagesPerSession: 80,
  warningThreshold: 0.8,
} as const;
