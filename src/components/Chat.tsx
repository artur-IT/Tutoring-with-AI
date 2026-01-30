import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import ChatStats from "./chat/ChatStats";
import type { Message, StudentData, AIResponse } from "../agents/mathTutor/types";
import { sessionLimits, contentRestrictions } from "../agents/mathTutor/config";
import { useDebounce } from "./hooks/useDebounce";
import { useOnline } from "./hooks/useOnline";
import { withOnlineProvider } from "./hooks/withOnlineProvider";
import { validateAndSanitizeInput } from "../lib/contentFilter";
import { useSessionManagement } from "./hooks/useSessionManagement";
import { useSessionTimer } from "./hooks/useSessionTimer";
import { useInitialGreeting } from "./hooks/useInitialGreeting";

function Chat() {
  const isOnline = useOnline();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [remainingRequests, setRemainingRequests] = useState<number>(sessionLimits.maxMessagesPerSession);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const TOKEN_LIMIT = 128_000;
  const MAX_MESSAGE_LENGTH = contentRestrictions.maxMessageLength;

  const {
    currentSessionId,
    sessionName,
    setShouldSaveSession,
    initialGreetingSentRef,
    saveCurrentSession,
    removeCurrentSessionFromHistory,
    buildSession,
    upsertSession,
    endSession,
  } = useSessionManagement(studentData);

  const handleTimeout = () => {
    if (messages.length > 1) {
      const session = buildSession(messages, tokensUsed);
      if (session) upsertSession(session);
    }
    alert("Czas sesji minął (30 minut).\n\nSesja zostanie zakończona. Historia rozmowy została zapisana.");
    setTimeout(() => {
      endSession();
    }, 3000);
  };

  const { timeRemaining, isSessionEnded, startTimer, endSession: endSessionTimer } = useSessionTimer(handleTimeout);

  const { sendInitialGreeting } = useInitialGreeting({
    studentData,
    currentSessionId,
    setMessages,
    setTokensUsed,
    setRemainingRequests,
    setShouldSaveSession,
    removeCurrentSessionFromHistory,
    setIsLoading,
    setError,
    initialGreetingSentRef,
  });

  useEffect(() => {
    const dataJson = localStorage.getItem("studentData");
    if (dataJson) {
      try {
        setStudentData(JSON.parse(dataJson));
      } catch (e) {
        console.error("Error loading student data:", e);
      }
    }
    setMessages([]);
    setTokensUsed(0);
    setRemainingRequests(sessionLimits.maxMessagesPerSession);
    startTimer();
  }, [startTimer]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isSessionEnded) return;
    const userMessageCount = messages.filter((msg) => msg.role === "user").length;
    if (userMessageCount >= sessionLimits.maxMessagesPerSession) {
      endSessionTimer();
      alert(
        `Osiągnięto limit wiadomości (${sessionLimits.maxMessagesPerSession} pytań).\n\nSesja zostanie zakończona. Historia rozmowy została zapisana.`
      );
      setTimeout(() => endSession(), 3000);
    }
  }, [messages, isSessionEnded, endSessionTimer, endSession]);

  useEffect(() => {
    if (!isSessionEnded) saveCurrentSession(messages, tokensUsed);
  }, [messages, tokensUsed, saveCurrentSession, isSessionEnded]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isSessionEnded) saveCurrentSession(messages, tokensUsed);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [messages, tokensUsed, saveCurrentSession, isSessionEnded]);

  useEffect(() => {
    if (messages.length === 0 && studentData && !isLoading && currentSessionId && !initialGreetingSentRef.current) {
      const timer = setTimeout(() => sendInitialGreeting(), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, studentData, isLoading, currentSessionId, sendInitialGreeting]);

  const handleSendInternal = async () => {
    if (!input.trim() || isLoading || isSessionEnded) return;

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
    const userMessagesBeforeNew = userMessageCount;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
          studentData,
          subject: studentData?.subject || "matematyka",
          sessionId: currentSessionId,
        }),
      });

      const data: AIResponse = await response.json();

      if (data.limitExceeded || response.status === 429) {
        setError(data.error || "Osiągnięto limit zapytań dla tej sesji. Proszę rozpocząć nową sesję.");
        setRemainingRequests(0);
        endSessionTimer();
        alert("Osiągnięto limit zapytań dla tej sesji.\n\nSesja zostanie zakończona.");
        setTimeout(() => endSession(), 3000);
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
          setTokensUsed((prev) => prev + data.metadata.tokens);
        }

        if (data.shouldRedirect) {
          if (userMessagesBeforeNew > 0 && messagesBeforeNew > 0) {
            const messagesToSave = messages.slice(0, -2);
            if (messagesToSave.length > 1) {
              const session = buildSession(messagesToSave, tokensUsed - (data.metadata?.tokens || 0));
              if (session) upsertSession(session);
            } else {
              removeCurrentSessionFromHistory();
            }
          } else {
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

  const handleEndSession = () => {
    if (messages.length > 1) {
      const session = buildSession(messages, tokensUsed);
      if (session) upsertSession(session);
    }
    endSession();
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto relative overflow-x-hidden overflow-y-auto">
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
