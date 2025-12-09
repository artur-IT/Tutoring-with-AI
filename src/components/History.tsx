import { useState } from "react";
import { Button } from "./ui/button";
import UserIcon from "../assets/icons/user.svg?url";
import ChevronRightIcon from "../assets/icons/chevron-right.svg?url";
import ArrowLeftSimpleIcon from "../assets/icons/arrow-left-simple.svg?url";
import type { ChatHistory, ChatSession } from "../agents/mathTutor/types";

// Load sessions helper function
const loadSessionsFromStorage = (): ChatSession[] => {
  const historyJson = localStorage.getItem("chatHistory");
  if (historyJson) {
    try {
      const history: ChatHistory = JSON.parse(historyJson);
      // Sort by last message time (newest first)
      return [...history.sessions].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    } catch (e) {
      console.error("Error loading history:", e);
      return [];
    }
  }
  return [];
};

export default function History() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const loaded = loadSessionsFromStorage();
    if (loaded.length > 0) {
      console.log("📚 [History.tsx] Załadowano", loaded.length, "sesji");
    }
    return loaded;
  });

  const handleSessionClick = (sessionId: string) => {
    // Set this session as current and redirect to chat
    const historyJson = localStorage.getItem("chatHistory");
    if (historyJson) {
      try {
        const history: ChatHistory = JSON.parse(historyJson);
        history.currentSessionId = sessionId;
        localStorage.setItem("chatHistory", JSON.stringify(history));
        // Use location.assign instead of direct assignment
        setTimeout(() => {
          location.assign("/chat");
        }, 0);
      } catch (e) {
        console.error("Error setting current session:", e);
      }
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the session

    if (confirm("Czy na pewno chcesz usunąć tę rozmowę?")) {
      const historyJson = localStorage.getItem("chatHistory");
      if (historyJson) {
        try {
          const history: ChatHistory = JSON.parse(historyJson);
          history.sessions = history.sessions.filter((s) => s.id !== sessionId);

          // If deleted session was current, clear current
          if (history.currentSessionId === sessionId) {
            history.currentSessionId = null;
          }

          localStorage.setItem("chatHistory", JSON.stringify(history));
          setSessions(history.sessions.sort((a, b) => b.lastMessageAt - a.lastMessageAt));
          console.log("🗑️ [History.tsx] Sesja usunięta");
        } catch (e) {
          console.error("Error deleting session:", e);
        }
      }
    }
  };

  const getFirstUserMessage = (session: ChatSession): string => {
    const firstUserMsg = session.messages.find((m) => m.role === "user");
    return firstUserMsg?.content || "Brak wiadomości";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-8 mt-8">Historia rozmów</h1>

      {/* Session list */}
      <div className="flex-1 space-y-4 mb-8">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">📭 Brak historii rozmów</p>
            <p className="text-sm">Rozpocznij nową rozmowę, aby utworzyć historię</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSessionClick(session.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSessionClick(session.id);
                }
              }}
              role="button"
              tabIndex={0}
              className="bg-white shadow-md rounded-xl p-4 md:p-6 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow w-full text-left"
            >
              {/* User icon */}
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <img src={UserIcon} alt="" className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              {/* Title and description */}
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-gray-900 mb-1">{session.name}</h2>
                <p className="text-sm text-gray-500 line-clamp-2">{getFirstUserMessage(session)}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>💬 {session.messages.filter((m) => m.role !== "system").length} wiadomości</span>
                  <span>🎫 {session.tokensUsed.toLocaleString()} tokenów</span>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="text-red-500 hover:text-red-700 p-2"
                  aria-label="Usuń rozmowę"
                >
                  🗑️
                </button>
                <img src={ChevronRightIcon} alt="" className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Back button */}
      <div className="flex justify-center mb-6">
        <a href="/" className="inline-block">
          <Button variant="back">
            <img src={ArrowLeftSimpleIcon} alt="" className="w-5 h-5" />
            wróć
          </Button>
        </a>
      </div>
    </div>
  );
}
