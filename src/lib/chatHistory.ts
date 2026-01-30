import type { ChatHistory } from "../agents/mathTutor/types";

export const getHistory = (): ChatHistory => {
  if (typeof window === "undefined") return { sessions: [], currentSessionId: null };
  try {
    return JSON.parse(localStorage.getItem("chatHistory") || '{"sessions":[],"currentSessionId":null}');
  } catch {
    return { sessions: [], currentSessionId: null };
  }
};

export const saveHistory = (history: ChatHistory) => {
  if (typeof window !== "undefined") localStorage.setItem("chatHistory", JSON.stringify(history));
};
