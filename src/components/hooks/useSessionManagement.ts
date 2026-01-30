import { useState, useCallback, useRef } from "react";
import type { Message, StudentData, ChatSession } from "../../agents/mathTutor/types";
import { getHistory, saveHistory } from "../../lib/chatHistory";

const createSessionName = () => {
  const now = new Date();
  return `${now.toLocaleDateString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" })} ${now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`;
};

const shouldSaveSessionWithMessages = (messagesLength: number) => messagesLength > 1;

export function useSessionManagement(studentData: StudentData | null) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [shouldSaveSession, setShouldSaveSession] = useState(true);
  const initialGreetingSentRef = useRef(false);

  const buildSession = useCallback(
    (messages: Message[], tokensUsed: number): ChatSession | null =>
      currentSessionId
        ? {
            id: currentSessionId,
            name: sessionName,
            messages,
            tokensUsed,
            createdAt: parseInt(currentSessionId),
            lastMessageAt: Date.now(),
            avatar: studentData?.avatar,
            topic: studentData?.topic,
          }
        : null,
    [currentSessionId, sessionName, studentData]
  );

  const upsertSession = useCallback((session: ChatSession) => {
    const history = getHistory();
    const sessionIndex = history.sessions.findIndex((item) => item.id === session.id);
    if (sessionIndex >= 0) {
      history.sessions[sessionIndex] = session;
    } else {
      history.sessions.push(session);
    }
    history.currentSessionId = session.id;
    saveHistory(history);
  }, []);

  const createNewSession = useCallback(() => {
    const newSessionId = Date.now().toString();
    const newSessionName = createSessionName();

    setCurrentSessionId(newSessionId);
    setSessionName(newSessionName);
    setShouldSaveSession(true);
    initialGreetingSentRef.current = false;

    const history = getHistory();
    history.currentSessionId = newSessionId;
    saveHistory(history);

    return { id: newSessionId, name: newSessionName };
  }, []);

  const saveCurrentSession = useCallback(
    (messages: Message[], tokensUsed: number) => {
      if (!currentSessionId || !shouldSaveSessionWithMessages(messages.length) || !shouldSaveSession) return;
      const session = buildSession(messages, tokensUsed);
      if (session) upsertSession(session);
    },
    [currentSessionId, shouldSaveSession, buildSession, upsertSession]
  );

  const removeCurrentSessionFromHistory = useCallback(() => {
    if (!currentSessionId) return;
    const history = getHistory();
    history.sessions = history.sessions.filter((s) => s.id !== currentSessionId);
    history.currentSessionId = null;
    saveHistory(history);
  }, [currentSessionId]);

  const endSession = useCallback(() => {
    const history = getHistory();
    history.currentSessionId = null;
    saveHistory(history);
    window.location.href = "/";
  }, []);

  return {
    currentSessionId,
    sessionName,
    shouldSaveSession,
    setShouldSaveSession,
    initialGreetingSentRef,
    createNewSession,
    saveCurrentSession,
    removeCurrentSessionFromHistory,
    buildSession,
    upsertSession,
    endSession,
  };
}
