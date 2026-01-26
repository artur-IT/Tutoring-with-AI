import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import ChatStats from "./chat/ChatStats";
import type { Message, StudentData, AIResponse, ChatSession, ChatHistory } from "../agents/mathTutor/types";
import { sessionLimits, contentRestrictions } from "../agents/mathTutor/config";
import { useDebounce } from "./hooks/useDebounce";
import { useOnline } from "./hooks/useOnline";
import { withOnlineProvider } from "./hooks/withOnlineProvider";
import { validateAndSanitizeInput } from "../lib/contentFilter";

function Chat() {
  const isOnline = useOnline();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [shouldSaveSession, setShouldSaveSession] = useState(true);
  const [remainingRequests, setRemainingRequests] = useState<number>(sessionLimits.maxMessagesPerSession);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(sessionLimits.maxSessionDuration * 60);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialGreetingSentRef = useRef(false);

  const TOKEN_LIMIT = 128_000;
  const MAX_MESSAGE_LENGTH = contentRestrictions.maxMessageLength;

  const createSessionName = () => {
    const now = new Date();
    const date = now.toLocaleDateString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" });
    const time = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  };

  const getHistory = (): ChatHistory =>
    JSON.parse(localStorage.getItem("chatHistory") || '{"sessions":[],"currentSessionId":null}');
  const saveHistory = (history: ChatHistory) => localStorage.setItem("chatHistory", JSON.stringify(history));

  const buildSession = useCallback(
    (messagesToSave: Message[] = messages, tokensToSave: number = tokensUsed): ChatSession | null =>
      currentSessionId
        ? {
            id: currentSessionId,
            name: sessionName,
            messages: messagesToSave,
            tokensUsed: tokensToSave,
            createdAt: parseInt(currentSessionId),
            lastMessageAt: Date.now(),
            avatar: studentData?.avatar,
            topic: studentData?.topic,
          }
        : null,
    [currentSessionId, sessionName, messages, tokensUsed, studentData]
  );

  const upsertSession = useCallback((history: ChatHistory, session: ChatSession) => {
    const sessionIndex = history.sessions.findIndex((item) => item.id === session.id);
    if (sessionIndex >= 0) {
      history.sessions[sessionIndex] = session;
      return;
    }
    history.sessions.push(session);
  }, []);

  const createNewSession = useCallback(() => {
    const newSessionId = Date.now().toString();
    const newSessionName = createSessionName();
    const startTime = Date.now();

    setCurrentSessionId(newSessionId);
    setSessionName(newSessionName);
    setMessages([]);
    setTokensUsed(0);
    setShouldSaveSession(true);
    setRemainingRequests(sessionLimits.maxMessagesPerSession);
    setSessionStartTime(startTime);
    setTimeRemaining(sessionLimits.maxSessionDuration * 60);
    setIsSessionEnded(false);
    initialGreetingSentRef.current = false; // Reset flag for new session

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const history = getHistory();
    history.currentSessionId = newSessionId;
    saveHistory(history);

    return { id: newSessionId, name: newSessionName };
  }, []);

  const saveCurrentSession = useCallback(() => {
    // Don't save sessions with only 1 message (just the initial greeting)
    if (!currentSessionId || messages.length <= 1 || !shouldSaveSession) return;
    const session = buildSession();
    if (!session) return;
    const history = getHistory();
    upsertSession(history, session);
    history.currentSessionId = currentSessionId;
    saveHistory(history);
  }, [currentSessionId, messages.length, shouldSaveSession, buildSession, upsertSession]);

  const removeCurrentSessionFromHistory = useCallback(() => {
    if (!currentSessionId) return;
    const history = getHistory();
    history.sessions = history.sessions.filter((s) => s.id !== currentSessionId);
    history.currentSessionId = null;
    saveHistory(history);
  }, [currentSessionId]);

  useEffect(() => {
    const dataJson = localStorage.getItem("studentData");
    if (dataJson) {
      try {
        setStudentData(JSON.parse(dataJson));
      } catch (e) {
        console.error("Error loading student data:", e);
      }
    }
    createNewSession();
  }, [createNewSession]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 192;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  const endSessionDueToLimit = useCallback(
    (reason: string) => {
      if (isSessionEnded) return;

      setIsSessionEnded(true);
      setIsLoading(false);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      // Don't save sessions with only 1 message (just the initial greeting)
      if (currentSessionId && messages.length > 1 && shouldSaveSession) {
        const session = buildSession();
        if (session) {
          const history = getHistory();
          upsertSession(history, session);
          history.currentSessionId = currentSessionId;
          saveHistory(history);
        }
      }

      alert(`${reason}\n\nSesja zostanie zakończona. Historia rozmowy została zapisana.`);

      setTimeout(() => {
        const finalHistory = getHistory();
        finalHistory.currentSessionId = null;
        saveHistory(finalHistory);
        window.location.href = "/";
      }, 3000);
    },
    [isSessionEnded, currentSessionId, messages.length, shouldSaveSession, buildSession, upsertSession]
  );

  useEffect(() => {
    if (!sessionStartTime || isSessionEnded) return;

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const remaining = Math.max(0, sessionLimits.maxSessionDuration * 60 - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) endSessionDueToLimit("Czas sesji minął (30 minut).");
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionStartTime, isSessionEnded, endSessionDueToLimit]);

  useEffect(() => {
    if (isSessionEnded) return;

    const userMessageCount = messages.filter((msg) => msg.role === "user").length;

    if (userMessageCount >= sessionLimits.maxMessagesPerSession) {
      endSessionDueToLimit(`Osiągnięto limit wiadomości (${sessionLimits.maxMessagesPerSession} pytań).`);
    }
  }, [messages, isSessionEnded, endSessionDueToLimit]);

  useEffect(() => {
    // Don't save sessions with only 1 message (just the initial greeting)
    if (currentSessionId && messages.length > 1 && shouldSaveSession && !isSessionEnded) {
      saveCurrentSession();
    }
  }, [messages, tokensUsed, currentSessionId, sessionName, shouldSaveSession, saveCurrentSession, isSessionEnded]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't save sessions with only 1 message (just the initial greeting)
      if (currentSessionId && messages.length > 1 && shouldSaveSession && !isSessionEnded) {
        const session = buildSession();
        if (!session) return;
        const history = getHistory();
        upsertSession(history, session);
        history.currentSessionId = currentSessionId;
        saveHistory(history);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentSessionId, messages.length, shouldSaveSession, isSessionEnded, buildSession, upsertSession]);

  // Send initial greeting message
  const sendInitialGreeting = useCallback(async () => {
    // Prevent multiple calls
    if (initialGreetingSentRef.current) return;
    initialGreetingSentRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      // Create a natural initial message that presents the student's actual problem
      // This way AI knows this is a real problem to help with, not just a general topic
      const initialPrompt = studentData?.problem
        ? `Cześć! Mam problem z: ${studentData.problem}. Możesz mi to wytłumaczyć?`
        : `Cześć! Chciałbym nauczyć się matematyki.`;

      const requestBody = {
        message: initialPrompt,
        history: [],
        studentData,
        subject: studentData?.subject || "matematyka",
        sessionId: currentSessionId,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data: AIResponse = await response.json();

      if (data.rateLimit) setRemainingRequests(data.rateLimit.remaining);

      if (data.success && data.response) {
        const aiMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages([aiMessage]);

        if (data.metadata?.tokens) setTokensUsed(data.metadata.tokens);

        if (data.shouldRedirect) {
          setShouldSaveSession(false);
          removeCurrentSessionFromHistory();
          localStorage.removeItem("studentData");
          setTimeout(() => window.location.replace("/tutors"), 8000);
        }
      } else {
        console.error("Błąd w automatycznym powitaniu:", data.error);
        setError(data.error || "Wystąpił błąd podczas rozpoczynania rozmowy");
        // Reset flag on error so user can retry
        initialGreetingSentRef.current = false;
      }
    } catch (err) {
      console.error("Initial greeting error:", err);
      setError("Nie można połączyć się z serwerem");
      // Reset flag on error so user can retry
      initialGreetingSentRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [studentData, currentSessionId, removeCurrentSessionFromHistory]);

  useEffect(() => {
    if (messages.length === 0 && studentData && !isLoading && currentSessionId && !initialGreetingSentRef.current) {
      const timer = setTimeout(() => sendInitialGreeting(), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, studentData, isLoading, currentSessionId, sendInitialGreeting]);

  // Send message to API
  const handleSendInternal = async () => {
    if (!input.trim() || isLoading || isSessionEnded) return;

    // Validate and sanitize user input
    const validation = validateAndSanitizeInput(input, {
      maxLength: MAX_MESSAGE_LENGTH,
      checkProfanity: true,
      checkPromptInjection: true,
      checkPersonalInfo: true,
    });

    if (!validation.isValid) {
      setError(validation.error || "Nieprawidłowa wiadomość");
      return;
    }

    const userMessageCount = messages.filter((msg) => msg.role === "user").length;
    if (userMessageCount >= sessionLimits.maxMessagesPerSession) {
      setError(`Osiągnięto limit wiadomości (${sessionLimits.maxMessagesPerSession} pytań).`);
      return;
    }

    if (timeRemaining <= 0) {
      setError("Czas sesji minął.");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: validation.sanitized || input.trim(),
      timestamp: Date.now(),
    };

    const messagesBeforeNew = messages.length;
    const userMessagesBeforeNew = messages.filter((msg) => msg.role === "user").length;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        message: userMessage.content,
        history: messages,
        studentData,
        subject: studentData?.subject || "matematyka",
        sessionId: currentSessionId,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data: AIResponse = await response.json();

      if (data.limitExceeded || response.status === 429) {
        setError(data.error || "Osiągnięto limit zapytań dla tej sesji. Proszę rozpocząć nową sesję.");
        setRemainingRequests(0);
        endSessionDueToLimit("Osiągnięto limit zapytań dla tej sesji.");
        return;
      }

      if (data.rateLimit) setRemainingRequests(data.rateLimit.remaining);

      if (data.success && data.response) {
        const aiMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (data.metadata?.tokens) {
          const newTokensUsed = tokensUsed + data.metadata.tokens;
          setTokensUsed(newTokensUsed);
        }

        if (data.shouldRedirect) {
          if (userMessagesBeforeNew > 0 && messagesBeforeNew > 0 && currentSessionId) {
            const messagesToSave = messages.slice(0, -2);
            // Don't save sessions with only 1 message (just the initial greeting)
            if (messagesToSave.length > 1) {
              const session = buildSession(messagesToSave, tokensUsed - (data.metadata?.tokens || 0));
              if (session) {
                const history = getHistory();
                upsertSession(history, session);
                history.currentSessionId = currentSessionId;
                saveHistory(history);
              }
            } else {
              setShouldSaveSession(false);
              removeCurrentSessionFromHistory();
            }
          } else {
            setShouldSaveSession(false);
            removeCurrentSessionFromHistory();
          }
          localStorage.removeItem("studentData");
          setTimeout(() => window.location.replace("/tutors"), 8000);
        }
      } else {
        console.error("Błąd w odpowiedzi:", data.error);
        setError(data.error || "Wystąpił błąd");
      }
    } catch (err) {
      console.error("Send error:", err);
      setError("Nie można połączyć się z serwerem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = useDebounce(handleSendInternal, 500);

  const handleEndSession = useCallback(() => {
    // Don't save sessions with only 1 message (just the initial greeting)
    if (messages.length > 1 && currentSessionId) {
      const session = buildSession();
      if (session) {
        const history = getHistory();
        upsertSession(history, session);
        history.currentSessionId = null;
        saveHistory(history);
      }
    } else {
      const history = getHistory();
      history.currentSessionId = null;
      saveHistory(history);
    }
    window.location.href = "/";
  }, [messages.length, currentSessionId, buildSession, upsertSession]);

  return (
    <div className="h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto relative overflow-x-hidden overflow-y-auto">
      <ChatHeader sessionName={sessionName} onEnd={handleEndSession} />

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        studentAvatar={studentData?.avatar}
        messagesEndRef={messagesEndRef}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ChatInput
        input={input}
        isLoading={isLoading}
        isSessionEnded={isSessionEnded}
        isOnline={isOnline}
        maxMessageLength={MAX_MESSAGE_LENGTH}
        onChange={setInput}
        onSend={handleSend}
        textareaRef={textareaRef}
      />

      <ChatStats
        remainingRequests={remainingRequests}
        maxMessagesPerSession={sessionLimits.maxMessagesPerSession}
        timeRemaining={timeRemaining}
        maxSessionDurationMinutes={sessionLimits.maxSessionDuration}
        tokensUsed={tokensUsed}
        tokenLimit={TOKEN_LIMIT}
      />
    </div>
  );
}

export default withOnlineProvider(Chat);
