import type { AgentConfig } from "./types";

/**
 * Math Tutor Agent Configuration
 *
 * This agent is a friendly, patient math teacher for teenagers (13-19 years old).
 * It only answers questions related to mathematics and provides safe, educational content.
 */
export const mathTutorConfig: AgentConfig = {
  name: "Matematyczny Korepetytor",
  subject: "matematyka",

  // Model configuration
  // mistral-small is fast and cost-effective for most math questions
  model: "mistral-small-latest",

  // Temperature: 0.7 is a good balance between creativity and precision
  // For math, we want mostly precise answers with some flexibility in explanations
  temperature: 0.7,

  // Max tokens: 500-1000 for concise but complete answers
  maxTokens: 800,

  description: "Przyjazny korepetytor matematyki dla nastolatków, wyjaśniający trudne zagadnienia w prosty sposób.",
};

// Safety and content restrictions
export const contentRestrictions = {
  // Maximum message length from user (characters)
  maxMessageLength: 400,

  // Maximum conversation history to send to API (to save costs)
  maxHistoryMessages: 15,

  // Timeout for API requests (milliseconds)
  apiTimeout: 30000, // 30 seconds

  // Age range for target audience
  targetAgeRange: {
    min: 13,
    max: 19,
  },
};

// Session limits
export const sessionLimits = {
  // Maximum session duration in minutes
  maxSessionDuration: 30,

  // Maximum number of messages per session
  maxMessagesPerSession: 50,

  // Warning threshold (percentage of limit)
  warningThreshold: 0.8, // Show warning at 80% of limit
};
