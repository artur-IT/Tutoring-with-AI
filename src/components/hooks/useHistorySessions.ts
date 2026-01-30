import { useState, useEffect } from "react";
import type { ChatHistory, ChatSession } from "../../agents/mathTutor/types";
import { getHistory, saveHistory } from "../../lib/chatHistory";

const loadSessionsFromStorage = (): ChatSession[] => {
  if (typeof window === "undefined") return [];
  try {
    const history: ChatHistory = JSON.parse(localStorage.getItem("chatHistory") || "{}");
    return [...(history.sessions || [])].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  } catch {
    return [];
  }
};

const FADE_OUT_DURATION = 400;

export function useHistorySessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMounted(true);
      setSessions(loadSessionsFromStorage());
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSessionClick = (sessionId: string) => {
    if (deletingSessionId === sessionId) return;

    try {
      const history = getHistory();
      history.currentSessionId = sessionId;
      saveHistory(history);
      setTimeout(() => location.assign("/history-chat"), 0);
    } catch (e) {
      console.error("Error setting current session:", e);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setDeletingSessionId(sessionId);

    setTimeout(() => {
      try {
        const history = getHistory();
        history.sessions = history.sessions.filter((s) => s.id !== sessionId);
        if (history.currentSessionId === sessionId) {
          history.currentSessionId = null;
        }
        saveHistory(history);
        setSessions(history.sessions.sort((a, b) => b.lastMessageAt - a.lastMessageAt));
        setDeletingSessionId(null);
      } catch (e) {
        console.error("Error deleting session:", e);
        setDeletingSessionId(null);
      }
    }, FADE_OUT_DURATION);
  };

  return {
    sessions,
    isMounted,
    deletingSessionId,
    handleSessionClick,
    handleDeleteSession,
  };
}
