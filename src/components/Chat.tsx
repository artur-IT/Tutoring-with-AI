import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import UserIcon from "../assets/icons/user.svg?url";
import PlusIcon from "../assets/icons/plus.svg?url";
import SendIcon from "../assets/icons/send.svg?url";
import type { Message, StudentData, AIResponse, ChatSession, ChatHistory } from "../agents/mathTutor/types";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Token limit per session (can be adjusted)
  const TOKEN_LIMIT = 128_000;

  // Create session name from date
  const createSessionName = () => {
    const now = new Date();
    const date = now.toLocaleDateString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" });
    const time = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  };

  // Create new session
  const createNewSession = useCallback(() => {
    const newSessionId = Date.now().toString();
    const newSessionName = createSessionName();

    setCurrentSessionId(newSessionId);
    setSessionName(newSessionName);
    setMessages([]);
    setTokensUsed(0);
    setShouldSaveSession(true); // Reset flag for new session

    console.log("🆕 [Chat.tsx] Nowa sesja utworzona:", newSessionName);
    return { id: newSessionId, name: newSessionName };
  }, []);

  // Save current session to history
  const saveCurrentSession = useCallback(() => {
    if (!currentSessionId || messages.length === 0) return;

    // Don't save session if it was ended due to topic mismatch
    if (!shouldSaveSession) {
      console.log("🚫 [Chat.tsx] Pomijam zapis sesji - zakończona z powodu niezgodności tematu");
      return;
    }

    const history: ChatHistory = JSON.parse(
      localStorage.getItem("chatHistory") || '{"sessions":[],"currentSessionId":null}'
    );

    const sessionIndex = history.sessions.findIndex((s) => s.id === currentSessionId);
    const session: ChatSession = {
      id: currentSessionId,
      name: sessionName,
      messages,
      tokensUsed,
      createdAt: parseInt(currentSessionId),
      lastMessageAt: Date.now(),
    };

    if (sessionIndex >= 0) {
      history.sessions[sessionIndex] = session;
    } else {
      history.sessions.push(session);
    }

    history.currentSessionId = currentSessionId;
    localStorage.setItem("chatHistory", JSON.stringify(history));
    console.log("💾 [Chat.tsx] Sesja zapisana:", sessionName);
  }, [currentSessionId, sessionName, messages, tokensUsed, shouldSaveSession]);

  // Remove current session from history (used when topic mismatch is detected)
  const removeCurrentSessionFromHistory = useCallback(() => {
    if (!currentSessionId) return;

    const history: ChatHistory = JSON.parse(
      localStorage.getItem("chatHistory") || '{"sessions":[],"currentSessionId":null}'
    );

    // Remove session from history
    history.sessions = history.sessions.filter((s) => s.id !== currentSessionId);

    // Clear current session ID
    history.currentSessionId = null;

    localStorage.setItem("chatHistory", JSON.stringify(history));
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
            setCurrentSessionId(session.id);
            setSessionName(session.name);
            setMessages(session.messages);
            setTokensUsed(session.tokensUsed);
            console.log("📂 [Chat.tsx] Załadowano aktywną sesję:", session.name);
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save session when messages or tokens change
  useEffect(() => {
    if (currentSessionId && messages.length > 0 && shouldSaveSession) {
      saveCurrentSession();
    }
  }, [messages, tokensUsed, currentSessionId, sessionName, shouldSaveSession, saveCurrentSession]);

  // Send initial greeting message
  const sendInitialGreeting = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create a special initial message that asks AI to start the conversation
      // Include the student's problem to pass the math topic check in the agent
      const initialPrompt = studentData?.problem
        ? `Przywitaj się i ogólnie wprowadź temat: ${studentData.problem}. Nie odpowiadaj na konkretne pytanie, tylko nawiąż do tematu.`
        : `Przywitaj się i powiedz ogólnie coś o matematyce.`;

      const requestBody = {
        message: initialPrompt,
        history: [],
        studentData,
        subject: studentData?.subject || "matematyka",
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
          console.log("🔄 [Chat.tsx] Wykryto niezgodność tematu w powitaniu - przekierowanie");
          console.log("🔄 [Chat.tsx] Treść odpowiedzi AI:", data.response);
          // Prevent saving this session to history
          setShouldSaveSession(false);
          // Remove session from history if it was already saved
          removeCurrentSessionFromHistory();
          // Clear student data to force new selection
          localStorage.removeItem("studentData");
          setTimeout(() => {
            console.log("🔄 [Chat.tsx] Wykonuję przekierowanie do /tutors");
            // Redirect to topic selection page using replace to avoid back button issues
            window.location.replace("/tutors");
          }, 8000); // 8 seconds delay to let user read the message
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
  }, [studentData, removeCurrentSessionFromHistory]);

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
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    console.log("📤 [Chat.tsx] Wysyłanie wiadomości...");
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    console.log("📝 [Chat.tsx] User message:", userMessage.content);

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
          console.log("🔄 [Chat.tsx] Wykryto niezgodność tematu - przekierowanie");
          console.log("🔄 [Chat.tsx] Treść odpowiedzi AI:", data.response);
          // Prevent saving this session to history
          setShouldSaveSession(false);
          // Remove session from history if it was already saved
          removeCurrentSessionFromHistory();
          // Clear student data to force new selection
          localStorage.removeItem("studentData");
          setTimeout(() => {
            console.log("🔄 [Chat.tsx] Wykonuję przekierowanie do /tutors");
            // Redirect to topic selection page using replace to avoid back button issues
            window.location.replace("/tutors");
          }, 8000); // 8 seconds delay to let user read the message
        } else {
          console.log("ℹ️ [Chat.tsx] shouldRedirect jest false, brak przekierowania");
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

  //  <style>
  //   progress::-moz-progress-bar {
  //     background: blue !important;
  //   }

  //   progress::-webkit-progress-bar {
  //     background-color: #000;
  //     width: 100%;
  //    }

  //   progress::-webkit-progress-value {
  //     background: yellow;
  //     width: 100%;
  //   }

  //   progress {
  //     color: blue !important;
  //   }
  // </style>

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
          {sessionName && <p className="text-xs text-gray-500 mt-1">{sessionName}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="back"
            onClick={() => {
              // Save current session if there are messages
              if (messages.length > 0) {
                saveCurrentSession();
              }

              // Clear current session ID so next chat starts fresh
              const history: ChatHistory = JSON.parse(
                localStorage.getItem("chatHistory") || '{"sessions":[],"currentSessionId":null}'
              );
              history.currentSessionId = null;
              localStorage.setItem("chatHistory", JSON.stringify(history));
              console.log("✅ [Chat.tsx] Sesja zakończona, następny chat będzie czysty");

              // Redirect to home page
              window.location.href = "/";
            }}
          >
            Koniec
          </Button>
        </div>
      </div>

      {/* Messages section */}
      <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">👋 Cześć {localStorage.getItem("userName")}</p>
            <p className="text-sm">
              Twój problem to <span className="font-bold">{studentData?.problem}</span>
            </p>
            <p className="text-sm">Postaram się to wytłumaczyć w sposób, który będzie dla Ciebie zrozumiały</p>
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === "assistant" ? (
            <div key={idx} className="flex items-start gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">👨‍🏫</div>
              </div>
              <div className="bg-yellow-200 rounded-2xl px-4 py-3 max-w-[80%]">
                <p className="text-sm font-semibold text-gray-900 mb-1">Korepetytor</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ) : (
            <div key={idx} className="flex items-start gap-3 justify-end">
              <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%]">
                <p className="text-sm font-semibold text-white mb-1">Ty</p>
                <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                  {studentData?.avatar || "🦊"}
                </div>
              </div>
            </div>
          )
        )}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <img src={UserIcon} alt="" className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-yellow-200 rounded-2xl px-4 py-3">
              <p className="text-sm text-gray-900">Pisze...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Input section */}
      <div className="bg-white rounded-xl shadow-md p-3 mb-4">
        <div className="flex items-center gap-2">
          {/* Plus icon button */}
          <button
            type="button"
            className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
            aria-label="Add attachment"
            disabled={isLoading}
          >
            <img src={PlusIcon} alt="" className="w-5 h-5" />
          </button>
          {/* Input field */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Wpisz pytanie z matematyki..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
              className="w-full rounded-lg border text-sm border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <img src={SendIcon} alt="" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress bar section - Token usage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-400 italic">wykorzystane tokeny</p>
          <p className="text-xs text-gray-500">
            {tokensUsed.toLocaleString()} / {TOKEN_LIMIT.toLocaleString()}
          </p>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${tokensUsed / TOKEN_LIMIT < 0.7 ? "bg-blue-600" : tokensUsed / TOKEN_LIMIT < 0.9 ? "bg-yellow-500" : "bg-red-500"}`}
            style={{ width: `${Math.min((tokensUsed / TOKEN_LIMIT) * 100, 100)}%` }}
          ></div>
        </div>
        {tokensUsed >= TOKEN_LIMIT && (
          <p className="text-xs text-red-600 mt-1">⚠️ Osiągnięto limit tokenów dla tej sesji</p>
        )}
      </div>
    </div>
  );
}
