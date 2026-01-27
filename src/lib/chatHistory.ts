import type { ChatHistory } from "../agents/mathTutor/types";

export const getHistory = (): ChatHistory => {
  if (typeof window === "undefined") return { sessions: [], currentSessionId: null };
  const historyJson = localStorage.getItem("chatHistory");
  return historyJson ? JSON.parse(historyJson) : { sessions: [], currentSessionId: null };
};

export const saveHistory = (history: ChatHistory): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("chatHistory", JSON.stringify(history));
};
