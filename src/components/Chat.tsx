import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import SendIcon from "../assets/icons/send.svg?url";
import type { Message, StudentData, AIResponse, ChatSession, ChatHistory } from "../agents/mathTutor/types";
import { sessionLimits, contentRestrictions } from "../agents/mathTutor/config";
import { useDebounce } from "./hooks/useDebounce";
import { useOnline } from "./hooks/useOnline";

export default function Chat() {
  const isOnline = useOnline();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [shouldSaveSession, setShouldSaveSession] = useState(true); // Flag to prevent saving sessions ended due to topic mismatch
  const [isSessionFromHistory, setIsSessionFromHistory] = useState(false); // Flag to check if session was loaded from history (read-only)
  const [remainingRequests, setRemainingRequests] = useState(sessionLimits.maxMessagesPerSession); // Rate limiting counter
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null); // Session start timestamp
  const [timeRemaining, setTimeRemaining] = useState(sessionLimits.maxSessionDuration * 60); // Time remaining in seconds
  const [isSessionEnded, setIsSessionEnded] = useState(false); // Flag to indicate session ended due to limits
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const TOKEN_LIMIT = 128_000;
  const MAX_MESSAGE_LENGTH = contentRestrictions.maxMessageLength;

  const cleanMathNotation = (text: string): string =>
    text
      .replace(/\/([^/]+)\//g, "$1")
      .replace(/\\?\\\(([^)]+)\\\)/g, "$1")
      .replace(/\\?\\\[([^\]]+)\\\]/g, "$1")
      .replace(/\$([^$]+)\$/g, "$1");

  const createSessionName = () => {
    const now = new Date();
    const date = now.toLocaleDateString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" });
    const time = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  };

  const getHistory = (): ChatHistory =>
    JSON.parse(localStorage.getItem("chatHistory") || '{"sessions":[],"currentSessionId":null}');
  const saveHistory = (history: ChatHistory) => localStorage.setItem("chatHistory", JSON.stringify(history));

  // Create new session
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
    setIsSessionFromHistory(false);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const history = getHistory();
    history.currentSessionId = newSessionId;
    saveHistory(history);

    return { id: newSessionId, name: newSessionName };
  }, []);

  // Save current session to history
  const saveCurrentSession = useCallback(() => {
    if (!currentSessionId || messages.length === 0 || !shouldSaveSession) return;

    const history = getHistory();
    const sessionIndex = history.sessions.findIndex((s) => s.id === currentSessionId);
    const session: ChatSession = {
      id: currentSessionId,
      name: sessionName,
      messages,
      tokensUsed,
      createdAt: parseInt(currentSessionId),
      lastMessageAt: Date.now(),
      avatar: studentData?.avatar,
      topic: studentData?.topic,
    };

    if (sessionIndex >= 0) {
      history.sessions[sessionIndex] = session;
    } else {
      history.sessions.push(session);
    }
    history.currentSessionId = currentSessionId;
    saveHistory(history);
  }, [currentSessionId, sessionName, messages, tokensUsed, shouldSaveSession, studentData]);

  const removeCurrentSessionFromHistory = useCallback(() => {
    if (!currentSessionId) return;
    const history = getHistory();
    history.sessions = history.sessions.filter((s) => s.id !== currentSessionId);
    history.currentSessionId = null;
    saveHistory(history);
  }, [currentSessionId]);

  // Load student data and current session on mount
  useEffect(() => {
    const dataJson = localStorage.getItem("studentData");
    if (dataJson) {
      try {
        setStudentData(JSON.parse(dataJson));
      } catch (e) {
        console.error("Error loading student data:", e);
      }
    }

    const historyJson = localStorage.getItem("chatHistory");
    if (historyJson) {
      try {
        const history: ChatHistory = JSON.parse(historyJson);

        if (history.currentSessionId) {
          const session = history.sessions.find((s) => s.id === history.currentSessionId);
          if (session) {
            setCurrentSessionId(session.id);
            setSessionName(session.name);
            setMessages(session.messages);
            setTokensUsed(session.tokensUsed);

            const isFromHistory = session.messages.length > 0;
            setIsSessionFromHistory(isFromHistory);

            if (!isFromHistory) {
              setSessionStartTime(session.createdAt || Date.now());
              const userMessageCount = session.messages.filter((msg) => msg.role === "user").length;
              setRemainingRequests(Math.max(0, sessionLimits.maxMessagesPerSession - userMessageCount));
            }
          } else {
            createNewSession();
          }
        } else {
          createNewSession();
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
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

  // End session due to limit (time or messages)
  const endSessionDueToLimit = useCallback(
    (reason: string) => {
      if (isSessionEnded) return;

      setIsSessionEnded(true);
      setIsLoading(false);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      const history = getHistory();
      if (currentSessionId && messages.length > 0 && shouldSaveSession) {
        const sessionIndex = history.sessions.findIndex((s) => s.id === currentSessionId);
        const session: ChatSession = {
          id: currentSessionId,
          name: sessionName,
          messages,
          tokensUsed,
          createdAt: parseInt(currentSessionId),
          lastMessageAt: Date.now(),
          avatar: studentData?.avatar,
          topic: studentData?.topic,
        };

        if (sessionIndex >= 0) {
          history.sessions[sessionIndex] = session;
        } else {
          history.sessions.push(session);
        }
        history.currentSessionId = currentSessionId;
        saveHistory(history);
      }

      alert(`${reason}\n\nSesja zostanie zakończona. Historia rozmowy została zapisana.`);

      setTimeout(() => {
        const finalHistory = getHistory();
        finalHistory.currentSessionId = null;
        saveHistory(finalHistory);
        window.location.href = "/";
      }, 3000);
    },
    [isSessionEnded, currentSessionId, messages, shouldSaveSession, sessionName, tokensUsed, studentData]
  );

  useEffect(() => {
    if (!sessionStartTime || isSessionFromHistory || isSessionEnded) return;

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const remaining = Math.max(0, sessionLimits.maxSessionDuration * 60 - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) endSessionDueToLimit("Czas sesji minął (30 minut).");
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionStartTime, isSessionFromHistory, isSessionEnded, endSessionDueToLimit]);

  useEffect(() => {
    if (isSessionFromHistory || isSessionEnded) return;

    const userMessageCount = messages.filter((msg) => msg.role === "user").length;

    if (userMessageCount >= sessionLimits.maxMessagesPerSession) {
      endSessionDueToLimit(`Osiągnięto limit wiadomości (${sessionLimits.maxMessagesPerSession} pytań).`);
    }
  }, [messages, isSessionFromHistory, isSessionEnded, endSessionDueToLimit]);

  useEffect(() => {
    if (!isSessionFromHistory && currentSessionId && messages.length > 0 && shouldSaveSession && !isSessionEnded) {
      saveCurrentSession();
    }
  }, [
    messages,
    tokensUsed,
    currentSessionId,
    sessionName,
    shouldSaveSession,
    saveCurrentSession,
    isSessionFromHistory,
    isSessionEnded,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSessionId && messages.length > 0 && shouldSaveSession && !isSessionEnded) {
        const history = getHistory();
        const sessionIndex = history.sessions.findIndex((s) => s.id === currentSessionId);
        const session: ChatSession = {
          id: currentSessionId,
          name: sessionName,
          messages,
          tokensUsed,
          createdAt: parseInt(currentSessionId),
          lastMessageAt: Date.now(),
          avatar: studentData?.avatar,
          topic: studentData?.topic,
        };

        if (sessionIndex >= 0) {
          history.sessions[sessionIndex] = session;
        } else {
          history.sessions.push(session);
        }
        history.currentSessionId = currentSessionId;
        saveHistory(history);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentSessionId, messages, tokensUsed, sessionName, shouldSaveSession, isSessionEnded, studentData]);

  // Send initial greeting message
  const sendInitialGreeting = useCallback(async () => {
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
          if (messages.length === 0) {
            setShouldSaveSession(false);
            removeCurrentSessionFromHistory();
          } else {
            saveCurrentSession();
          }
          localStorage.removeItem("studentData");
          setTimeout(() => window.location.replace("/tutors"), 8000);
        }
      } else {
        console.error("Błąd w automatycznym powitaniu:", data.error);
        setError(data.error || "Wystąpił błąd podczas rozpoczynania rozmowy");
      }
    } catch (err) {
      console.error("Initial greeting error:", err);
      setError("Nie można połączyć się z serwerem");
    } finally {
      setIsLoading(false);
    }
  }, [studentData, currentSessionId, messages.length, removeCurrentSessionFromHistory, saveCurrentSession]);

  useEffect(() => {
    if (messages.length === 0 && studentData && !isLoading && currentSessionId) {
      const timer = setTimeout(() => sendInitialGreeting(), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, studentData, isLoading, currentSessionId, sendInitialGreeting]);

  // Send message to API
  const handleSendInternal = async () => {
    if (!input.trim() || isLoading || isSessionEnded) return;

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
      content: input.trim(),
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
            const history = getHistory();
            const sessionIndex = history.sessions.findIndex((s) => s.id === currentSessionId);
            const messagesToSave = messages.slice(0, -2);
            if (messagesToSave.length > 0) {
              const session: ChatSession = {
                id: currentSessionId,
                name: sessionName,
                messages: messagesToSave,
                tokensUsed: tokensUsed - (data.metadata?.tokens || 0),
                createdAt: parseInt(currentSessionId),
                lastMessageAt: Date.now(),
                avatar: studentData?.avatar,
                topic: studentData?.topic,
              };

              if (sessionIndex >= 0) {
                history.sessions[sessionIndex] = session;
              } else {
                history.sessions.push(session);
              }
              history.currentSessionId = currentSessionId;
              saveHistory(history);
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

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{isSessionFromHistory ? "Historia rozmowy" : "Chat"}</h1>
          {sessionName && <p className="text-xs text-gray-500 mt-1">{sessionName}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="back"
            onClick={() => {
              if (isSessionFromHistory) {
                window.location.href = "/history";
                return;
              }

              if (messages.length > 0 && currentSessionId) {
                const history = getHistory();
                const sessionIndex = history.sessions.findIndex((s) => s.id === currentSessionId);
                const session: ChatSession = {
                  id: currentSessionId,
                  name: sessionName,
                  messages,
                  tokensUsed,
                  createdAt: parseInt(currentSessionId),
                  lastMessageAt: Date.now(),
                  avatar: studentData?.avatar,
                  topic: studentData?.topic,
                };

                if (sessionIndex >= 0) {
                  history.sessions[sessionIndex] = session;
                } else {
                  history.sessions.push(session);
                }
                history.currentSessionId = null;
                saveHistory(history);
              } else {
                const history = getHistory();
                history.currentSessionId = null;
                saveHistory(history);
              }

              window.location.href = "/";
            }}
          >
            {isSessionFromHistory ? "Wróć" : "Koniec"}
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Postaram się to wytłumaczyć w sposób, który będzie dla Ciebie zrozumiały</p>
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === "assistant" ? (
            <div key={idx} className="flex items-start gap-3">
              <Avatar className="w-10 h-10 shrink-0 bg-yellow-100">
                <AvatarFallback className="text-2xl bg-yellow-100">👨‍🏫</AvatarFallback>
              </Avatar>
              <div className="bg-yellow-200 rounded-2xl px-4 py-3 max-w-[80%]">
                <p className="text-sm font-semibold text-gray-900 mb-1">Korepetytor</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{cleanMathNotation(msg.content)}</p>
              </div>
            </div>
          ) : (
            <div key={idx} className="flex items-start gap-3 justify-end">
              <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%]">
                <p className="text-sm font-semibold text-white mb-1">Ty</p>
                <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
              </div>
              <Avatar className="w-10 h-10 shrink-0 bg-blue-100">
                <AvatarFallback className="text-2xl bg-blue-100">{studentData?.avatar || "🦊"}</AvatarFallback>
              </Avatar>
            </div>
          )
        )}

        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 shrink-0 bg-yellow-100">
              <AvatarFallback className="text-2xl bg-yellow-100">👨‍🏫</AvatarFallback>
            </Avatar>
            <div className="bg-yellow-200 rounded-2xl px-4 py-3 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isSessionFromHistory && (
        <div className="bg-white rounded-xl shadow-md p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={
                  isSessionEnded
                    ? "Sesja zakończona"
                    : !isOnline
                      ? "Brak połączenia z internetem"
                      : "Wpisz pytanie z matematyki..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.length < MAX_MESSAGE_LENGTH) {
                      handleSend();
                    }
                  }
                }}
                disabled={isLoading || isSessionEnded || !isOnline}
                className={`w-full max-h-48 min-w-0 rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none resize-none overflow-y-auto disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                  input.length >= MAX_MESSAGE_LENGTH
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]"
                    : "border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                }`}
                aria-invalid={input.length >= MAX_MESSAGE_LENGTH}
              />
              <p
                className={`text-xs mt-1 text-right ${input.length >= MAX_MESSAGE_LENGTH ? "text-red-500" : "text-gray-500"}`}
              >
                {input.length} / {MAX_MESSAGE_LENGTH}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim() || isSessionEnded || input.length >= MAX_MESSAGE_LENGTH || !isOnline}
              className="shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <img src={SendIcon} alt="" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {!isSessionFromHistory && (
        <div className="mb-4 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400 italic">pozostałe zapytania</p>
              <p className="text-xs text-gray-500">
                {remainingRequests} / {sessionLimits.maxMessagesPerSession}
              </p>
            </div>
            <Progress
              value={(remainingRequests / sessionLimits.maxMessagesPerSession) * 100}
              className={`h-2 ${remainingRequests / sessionLimits.maxMessagesPerSession > 0.2 ? "[&>div]:bg-blue-600" : "[&>div]:bg-red-500"}`}
            />
            {remainingRequests === 0 && (
              <p className="text-xs text-red-600 mt-1">⚠️ Osiągnięto limit zapytań dla tej sesji</p>
            )}
            {remainingRequests > 0 && remainingRequests <= sessionLimits.maxMessagesPerSession * 0.2 && (
              <p className="text-xs text-yellow-600 mt-1">⚠️ Zostało niewiele zapytań</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400 italic">czas sesji</p>
              <p className="text-xs text-gray-500">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
              </p>
            </div>
            <Progress
              value={(timeRemaining / (sessionLimits.maxSessionDuration * 60)) * 100}
              className={`h-2 ${timeRemaining / (sessionLimits.maxSessionDuration * 60) > 0.2 ? "[&>div]:bg-green-600" : "[&>div]:bg-red-500"}`}
            />
            {timeRemaining <= 0 && <p className="text-xs text-red-600 mt-1">⚠️ Czas sesji minął</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400 italic">wykorzystane tokeny</p>
              <p className="text-xs text-gray-500">
                {tokensUsed.toLocaleString()} / {TOKEN_LIMIT.toLocaleString()}
              </p>
            </div>
            <Progress
              value={Math.min((tokensUsed / TOKEN_LIMIT) * 100, 100)}
              className={`h-2 ${tokensUsed / TOKEN_LIMIT < 0.7 ? "[&>div]:bg-blue-600" : tokensUsed / TOKEN_LIMIT < 0.9 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"}`}
            />
            {tokensUsed >= TOKEN_LIMIT && (
              <p className="text-xs text-red-600 mt-1">⚠️ Osiągnięto limit tokenów dla tej sesji</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
