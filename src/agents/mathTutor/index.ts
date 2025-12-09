import { Mistral } from "@mistralai/mistralai";
import { mathTutorConfig, contentRestrictions } from "./config";
import { getSystemPrompt, getOffTopicResponse } from "./prompts";
import type { Message, ChatHistory, AIResponse, StudentData } from "./types";

// Initialize Mistral client
// API key should be in environment variable MISTRAL_API_KEY
const getMistralClient = (): Mistral => {
  const apiKey = import.meta.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY environment variable is not set");
  }

  return new Mistral({ apiKey });
};

// Validate user message
// Checks message length and basic content safety
const validateMessage = (message: string): { valid: boolean; error?: string } => {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: "Wiadomość nie może być pusta" };
  }

  if (message.length > contentRestrictions.maxMessageLength) {
    return {
      valid: false,
      error: `Wiadomość jest za długa (max ${contentRestrictions.maxMessageLength} znaków)`,
    };
  }

  return { valid: true };
};

// Check if question is related to mathematics
// Uses keywords and symbols from config.ts
const isMathRelated = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();

  // Check if message contains math keywords (Polish words like "równanie", "oblicz", etc.)
  const containsKeyword = contentRestrictions.mathKeywords.some((keyword) => lowerMessage.includes(keyword));

  // Check if message contains math symbols (numbers, operators, etc.)
  const containsMathSymbols = contentRestrictions.mathSymbolsPattern.test(message);

  // Return true if either keywords or symbols are found
  return containsKeyword || containsMathSymbols;
};

// Format conversation history for Mistral API
// Limits history to recent messages to save costs
const formatHistory = (history: Message[], studentData?: StudentData): Message[] => {
  // Add system prompt as first message
  const systemMessage: Message = {
    role: "system",
    content: getSystemPrompt(studentData),
  };

  // Get recent messages (limit to save costs)
  const recentMessages = history.slice(-contentRestrictions.maxHistoryMessages);

  return [systemMessage, ...recentMessages];
};

// Send message to Mistral AI and get response
// Main function to interact with the AI agent
export const sendMessage = async (
  userMessage: string,
  history: Message[] = [],
  studentData?: StudentData
): Promise<AIResponse> => {
  const startTime = Date.now();

  try {
    // Validate user message
    const validation = validateMessage(userMessage);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Check if question is math-related
    if (!isMathRelated(userMessage)) {
      return {
        success: true,
        response: getOffTopicResponse(),
      };
    }

    // Add user message to history
    const userMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    // Format messages for API
    const messages = formatHistory([...history, userMsg], studentData);

    // Initialize Mistral client
    const client = getMistralClient();

    // Call Mistral API
    const chatResponse = await client.chat.complete({
      model: mathTutorConfig.model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: mathTutorConfig.temperature,
      maxTokens: mathTutorConfig.maxTokens,
    });

    // Extract response
    const aiMessage = chatResponse.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return {
        success: false,
        error: "Nie otrzymano odpowiedzi od AI",
      };
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      response: typeof aiMessage === "string" ? aiMessage : JSON.stringify(aiMessage),
      metadata: {
        model: mathTutorConfig.model,
        tokens: chatResponse.usage?.totalTokens,
        duration,
      },
    };
  } catch (error) {
    console.error("Error calling Mistral API:", error);

    return {
      success: false,
      error:
        error instanceof Error ? `Wystąpił błąd: ${error.message}` : "Wystąpił nieznany błąd podczas łączenia z AI",
    };
  }
};

// Get chat history from localStorage
export const getChatHistory = (): Message[] => {
  try {
    const historyJson = localStorage.getItem("chatHistory");
    if (historyJson) {
      return JSON.parse(historyJson) as Message[];
    }
  } catch (error) {
    console.error("Error loading chat history:", error);
  }
  return [];
};

// Save chat history to localStorage
export const saveChatHistory = (messages: Message[]): void => {
  try {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
};

// Clear chat history from localStorage
export const clearChatHistory = (): void => {
  try {
    localStorage.removeItem("chatHistory");
  } catch (error) {
    console.error("Error clearing chat history:", error);
  }
};

// Get student data from localStorage
export const getStudentData = (): StudentData | null => {
  try {
    const dataJson = localStorage.getItem("studentData");
    if (dataJson) {
      return JSON.parse(dataJson) as StudentData;
    }
  } catch (error) {
    console.error("Error loading student data:", error);
  }
  return null;
};
