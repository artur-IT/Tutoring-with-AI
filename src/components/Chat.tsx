import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import PlusIcon from "../assets/icons/plus.svg?url";
import SendIcon from "../assets/icons/send.svg?url";
import type { Message, StudentData, AIResponse, ChatSession, ChatHistory } from "../agents/mathTutor/types";
import { sessionLimits } from "../agents/mathTutor/config";
import { useDebounce } from "./hooks/useDebounce";

export default function Chat() {
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

  // Token limit per session (can be adjusted)
  const TOKEN_LIMIT = 128_000;

  // Clean LaTeX notation from AI response
  // Removes / / delimiters and other LaTeX markers for better readability
  const cleanMathNotation = (text: string): string => {
    return text
      .replace(/\/([^/]+)\//g, "$1") // Remove /expression/
      .replace(/\\?\\\(([^)]+)\\\)/g, "$1") // Remove \(expression\)
      .replace(/\\?\\\[([^\]]+)\\\]/g, "$1") // Remove \[expression\]
      .replace(/\$([^$]+)\$/g, "$1"); // Remove $expression$
  };

  // Create session name from date
  const createSessionName = () => {
    const now = new Date();
    const date = now.toLocaleDateString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" });
    const time = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  };

  // Helper to get history from localStorage
  const getHistory = (): ChatHistory =>
    JSON.parse(localStorage.getItem("chatHistory") || '{"sessions":[],"currentSessionId":null}');

  // Helper to save history to localStorage
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
    setShouldSaveSession(true); // Reset flag for new session
    setRemainingRequests(sessionLimits.maxMessagesPerSession); // Reset rate limit counter
    setSessionStartTime(startTime); // Set session start time
    setTimeRemaining(sessionLimits.maxSessionDuration * 60); // Reset timer (30 minutes in seconds)
    setIsSessionEnded(false); // Reset session ended flag
    setIsSessionFromHistory(false); // Reset history flag

    // Clear existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Update localStorage with new session ID
    const history = getHistory();
    history.currentSessionId = newSessionId;
    saveHistory(history);

    console.log("🆕 [Chat.tsx] Nowa sesja utworzona:", newSessionName);
    return { id: newSessionId, name: newSessionName };
  }, []);

  // Save current session to history
  const saveCurrentSession = useCallback(() => {
    if (!currentSessionId || messages.length === 0 || !shouldSaveSession) {
      if (!shouldSaveSession)
        console.log("🚫 [Chat.tsx] Pomijam zapis sesji - zakończona z powodu niezgodności tematu");
      return;
    }

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
    console.log("💾 [Chat.tsx] Sesja zapisana:", sessionName);
  }, [currentSessionId, sessionName, messages, tokensUsed, shouldSaveSession, studentData]);

  // Remove current session from history (used when topic mismatch is detected)
  const removeCurrentSessionFromHistory = useCallback(() => {
    if (!currentSessionId) return;
    const history = getHistory();
    history.sessions = history.sessions.filter((s) => s.id !== currentSessionId);
    history.currentSessionId = null;
    saveHistory(history);
    console.log("🗑️ [Chat.tsx] Sesja usunięta z historii z powodu niezgodności tematu");
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

        // Load current session or create new one
        if (history.currentSessionId) {
          const session = history.sessions.find((s) => s.id === history.currentSessionId);
          if (session) {
            // Load the session
            setCurrentSessionId(session.id);
            setSessionName(session.name);
            setMessages(session.messages);
            setTokensUsed(session.tokensUsed);

            // If session has messages, it's from history (read-only)
            // If session has no messages, it's an active session (can be continued)
            const isFromHistory = session.messages.length > 0;
            setIsSessionFromHistory(isFromHistory);

            if (isFromHistory) {
              // Session from history - read-only mode
              console.log("📂 [Chat.tsx] Załadowano sesję z historii (read-only):", session.name);
            } else {
              // Active session (no messages yet) - can be continued
              setSessionStartTime(session.createdAt || Date.now());
              // Calculate remaining requests based on user messages
              const userMessageCount = session.messages.filter((msg) => msg.role === "user").length;
              setRemainingRequests(Math.max(0, sessionLimits.maxMessagesPerSession - userMessageCount));
              console.log("📂 [Chat.tsx] Załadowano aktywną sesję:", session.name);
            }
          } else {
            // Session ID exists but session not found - create new one
            createNewSession();
          }
        } else {
          // No current session ID - create new one
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

  // Auto-scroll to bottom
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // End session due to limit (time or messages)
  const endSessionDueToLimit = useCallback(
    (reason: string) => {
      if (isSessionEnded) return; // Prevent multiple calls

      setIsSessionEnded(true);
      setIsLoading(false); // Stop any ongoing requests

      // Clear timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Save current session synchronously before redirecting
      // Use current values directly to avoid stale closure issues
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
        console.log("💾 [Chat.tsx] Sesja zapisana przed zakończeniem:", sessionName);
      }

      // Show alert and redirect after delay
      alert(`${reason}\n\nSesja zostanie zakończona. Historia rozmowy została zapisana.`);

      setTimeout(() => {
        // Clear current session ID
        const finalHistory = getHistory();
        finalHistory.currentSessionId = null;
        saveHistory(finalHistory);

        // Redirect to home
        window.location.href = "/";
      }, 3000);
    },
    [isSessionEnded, currentSessionId, messages, shouldSaveSession, sessionName, tokensUsed, studentData]
  );

  // Timer for session duration
  useEffect(() => {
    if (!sessionStartTime || isSessionFromHistory || isSessionEnded) {
      return;
    }

    // Update timer every second
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const remaining = Math.max(0, sessionLimits.maxSessionDuration * 60 - elapsed);
      setTimeRemaining(remaining);

      // End session when time runs out
      if (remaining === 0) {
        endSessionDueToLimit("Czas sesji minął (30 minut).");
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [sessionStartTime, isSessionFromHistory, isSessionEnded, endSessionDueToLimit]);

  // Check if session should end due to message limit
  useEffect(() => {
    if (isSessionFromHistory || isSessionEnded) return;

    // Count user messages (questions)
    const userMessageCount = messages.filter((msg) => msg.role === "user").length;

    if (userMessageCount >= sessionLimits.maxMessagesPerSession) {
      endSessionDueToLimit(`Osiągnięto limit wiadomości (${sessionLimits.maxMessagesPerSession} pytań).`);
    }
  }, [messages, isSessionFromHistory, isSessionEnded, endSessionDueToLimit]);

  // Save session when messages or tokens change (only if not from history)
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

  // Save session before page unload (browser close/refresh)
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
        console.log("💾 [Chat.tsx] Sesja zapisana przed zamknięciem strony:", sessionName);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
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
        sessionId: currentSessionId, // Include session ID for rate limiting
      };

      console.log("🔄 [Chat.tsx] Initial greeting request:", {
        studentData: requestBody.studentData,
        subject: requestBody.subject,
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("📡 [Chat.tsx] Initial greeting response status:", response.status);
      const data: AIResponse = await response.json();
      console.log("📦 [Chat.tsx] Initial greeting response data:", data);

      // Update remaining requests from API response
      if (data.rateLimit) {
        setRemainingRequests(data.rateLimit.remaining);
        console.log(`📊 [Chat.tsx] Pozostało zapytań: ${data.rateLimit.remaining}/${data.rateLimit.limit}`);
      }

      if (data.success && data.response) {
        const aiMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        console.log("✅ [Chat.tsx] AI rozpoczęło rozmowę:", aiMessage.content.substring(0, 100) + "...");
        setMessages([aiMessage]);

        // Update tokens count
        if (data.metadata?.tokens) {
          setTokensUsed(data.metadata.tokens);
          console.log("🎫 [Chat.tsx] Tokeny użyte w powitaniu:", data.metadata.tokens);
        }

        // Check if we should redirect to topic selection (topic mismatch detected)
        if (data.shouldRedirect) {
          console.log("🔄 [Chat.tsx] Wykryto niezgodność tematu w powitaniu - przekierowanie", data.response);
          // Only prevent saving if this is the first message (greeting)
          // If session already has messages, save it before redirecting
          if (messages.length === 0) {
            setShouldSaveSession(false);
            removeCurrentSessionFromHistory();
          } else {
            // Session started correctly, save it before redirecting
            saveCurrentSession();
          }
          localStorage.removeItem("studentData");
          setTimeout(() => {
            console.log("🔄 [Chat.tsx] Wykonuję przekierowanie do /tutors");
            window.location.replace("/tutors");
          }, 8000);
        }
      } else {
        console.error("❌ [Chat.tsx] Błąd w automatycznym powitaniu:", data.error);
        setError(data.error || "Wystąpił błąd podczas rozpoczynania rozmowy");
      }
    } catch (err) {
      console.error("❌ [Chat.tsx] Initial greeting error:", err);
      setError("Nie można połączyć się z serwerem");
    } finally {
      setIsLoading(false);
      console.log("✅ [Chat.tsx] Zakończono wysyłanie automatycznego powitania");
    }
  }, [studentData, currentSessionId, messages.length, removeCurrentSessionFromHistory, saveCurrentSession]);

  // Send initial greeting from AI after 2 seconds
  useEffect(() => {
    // Only trigger if: no messages yet, we have student data, not loading, and we have a session
    if (messages.length === 0 && studentData && !isLoading && currentSessionId) {
      console.log("⏳ [Chat.tsx] Planowanie automatycznej wiadomości powitalnej za 2 sekundy...");

      const timer = setTimeout(() => {
        console.log("🤖 [Chat.tsx] Wysyłanie automatycznej wiadomości powitalnej...");
        sendInitialGreeting();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messages.length, studentData, isLoading, currentSessionId, sendInitialGreeting]);

  // Send message to API
  const handleSendInternal = async () => {
    if (!input.trim() || isLoading || isSessionEnded) return;

    // Check if we've reached the message limit
    const userMessageCount = messages.filter((msg) => msg.role === "user").length;
    if (userMessageCount >= sessionLimits.maxMessagesPerSession) {
      setError(`Osiągnięto limit wiadomości (${sessionLimits.maxMessagesPerSession} pytań).`);
      return;
    }

    // Check if time has run out
    if (timeRemaining <= 0) {
      setError("Czas sesji minął.");
      return;
    }

    console.log("📤 [Chat.tsx] Wysyłanie wiadomości...");
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    console.log("📝 [Chat.tsx] User message:", userMessage.content);

    // Store messages count before adding new message (to check if session started correctly)
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
        sessionId: currentSessionId, // Include session ID for rate limiting
      };
      console.log("🔄 [Chat.tsx] Request body:", {
        message: requestBody.message,
        historyLength: requestBody.history.length,
        studentData: requestBody.studentData,
        subject: requestBody.subject,
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("📡 [Chat.tsx] Response status:", response.status);
      const data: AIResponse = await response.json();
      console.log("📦 [Chat.tsx] Response data:", data);
      console.log("🔄 [Chat.tsx] shouldRedirect:", data.shouldRedirect);

      // Handle rate limit exceeded
      if (data.limitExceeded || response.status === 429) {
        console.warn("⚠️ [Chat.tsx] Limit zapytań przekroczony");
        setError(data.error || "Osiągnięto limit zapytań dla tej sesji. Proszę rozpocząć nową sesję.");
        setRemainingRequests(0);
        endSessionDueToLimit("Osiągnięto limit zapytań dla tej sesji.");
        return;
      }

      // Update remaining requests from API response
      if (data.rateLimit) {
        setRemainingRequests(data.rateLimit.remaining);
        console.log(`📊 [Chat.tsx] Pozostało zapytań: ${data.rateLimit.remaining}/${data.rateLimit.limit}`);
      }

      if (data.success && data.response) {
        const aiMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        console.log("✅ [Chat.tsx] AI odpowiedziało:", aiMessage.content.substring(0, 100) + "...");
        setMessages((prev) => [...prev, aiMessage]);

        // Update tokens count
        if (data.metadata?.tokens) {
          const newTokensUsed = tokensUsed + data.metadata.tokens;
          setTokensUsed(newTokensUsed);
          console.log("🎫 [Chat.tsx] Tokeny użyte w tej odpowiedzi:", data.metadata.tokens);
          console.log("📊 [Chat.tsx] Suma tokenów w sesji:", newTokensUsed);
        }

        // Check if we should redirect to topic selection
        if (data.shouldRedirect) {
          console.log("🔄 [Chat.tsx] Wykryto niezgodność tematu - przekierowanie", data.response);

          // If session started correctly (has previous messages before the problematic one), save it
          if (userMessagesBeforeNew > 0 && messagesBeforeNew > 0 && currentSessionId) {
            console.log("💾 [Chat.tsx] Sesja rozpoczęta prawidłowo - zapisuję przed przekierowaniem");
            // Save session with messages up to (but not including) the problematic one
            // The problematic user message and AI response are already added to messages
            // but we want to save the session as it was before the error
            const history = getHistory();
            const sessionIndex = history.sessions.findIndex((s) => s.id === currentSessionId);
            // Save messages without the last two (problematic user message + AI redirect response)
            const messagesToSave = messages.slice(0, -2);
            if (messagesToSave.length > 0) {
              const session: ChatSession = {
                id: currentSessionId,
                name: sessionName,
                messages: messagesToSave,
                tokensUsed: tokensUsed - (data.metadata?.tokens || 0), // Subtract tokens from problematic response
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
              console.log("💾 [Chat.tsx] Sesja zapisana przed przekierowaniem:", sessionName);
            }
          } else {
            // No previous messages, this is the first problematic query - don't save
            console.log("🚫 [Chat.tsx] Sesja nie rozpoczęła się prawidłowo - nie zapisuję");
            setShouldSaveSession(false);
            removeCurrentSessionFromHistory();
          }
          localStorage.removeItem("studentData");
          setTimeout(() => {
            console.log("🔄 [Chat.tsx] Wykonuję przekierowanie do /tutors");
            window.location.replace("/tutors");
          }, 8000);
        }
      } else {
        console.error("❌ [Chat.tsx] Błąd w odpowiedzi:", data.error);
        setError(data.error || "Wystąpił błąd");
      }
    } catch (err) {
      console.error("❌ [Chat.tsx] Send error:", err);
      setError("Nie można połączyć się z serwerem");
    } finally {
      setIsLoading(false);
      console.log("✅ [Chat.tsx] Zakończono wysyłanie");
    }
  };

  // Debounced version of handleSend to prevent rapid successive calls
  // User can click multiple times, but the function will only execute once after 500ms delay
  const handleSend = useDebounce(handleSendInternal, 500);

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto relative">
      {/* Header */}
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
                // In history mode, redirect back to history
                window.location.href = "/history";
                return;
              }

              // Save current session if there are messages (synchronously)
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
                history.currentSessionId = null; // Clear current session ID
                saveHistory(history);
                console.log("💾 [Chat.tsx] Sesja zapisana przed zakończeniem:", sessionName);
              } else {
                // Clear current session ID so next chat starts fresh
                const history = getHistory();
                history.currentSessionId = null;
                saveHistory(history);
              }

              console.log("✅ [Chat.tsx] Sesja zakończona, następny chat będzie czysty");

              // Redirect to home page
              window.location.href = "/";
            }}
          >
            {isSessionFromHistory ? "Wróć" : "Koniec"}
          </Button>
        </div>
      </div>

      {/* Messages section */}
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

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input section - hidden if session was loaded from history */}
      {!isSessionFromHistory && (
        <div className="bg-white rounded-xl shadow-md p-3 mb-4">
          <div className="flex items-center gap-2">
            {/* Plus icon button */}
            <button
              type="button"
              className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
              aria-label="Add attachment"
              disabled={isLoading || isSessionEnded}
            >
              <img src={PlusIcon} alt="" className="w-5 h-5" />
            </button>
            {/* Input field */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder={isSessionEnded ? "Sesja zakończona" : "Wpisz pytanie z matematyki..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading || isSessionEnded}
              />
            </div>
            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim() || isSessionEnded}
              className="shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <img src={SendIcon} alt="" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Progress bars section - hidden if session was loaded from history */}
      {!isSessionFromHistory && (
        <div className="mb-4 space-y-4">
          {/* Token usage */}
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

          {/* Session timer */}
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

          {/* Rate limiting - remaining requests */}
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
        </div>
      )}
    </div>
  );
}
