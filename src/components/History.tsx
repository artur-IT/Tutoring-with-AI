import { useState, useEffect } from "react";
import { buttonVariants } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import UserIcon from "../assets/icons/user.svg?url";
import ChevronRightIcon from "../assets/icons/chevron-right.svg?url";
import ArrowLeftSimpleIcon from "../assets/icons/arrow-left-simple.svg?url";
import type { ChatHistory, ChatSession } from "../agents/mathTutor/types";

// Load sessions helper function
const loadSessionsFromStorage = (): ChatSession[] => {
  if (typeof window === "undefined") return [];
  const historyJson = localStorage.getItem("chatHistory");
  if (!historyJson) return [];
  try {
    const history: ChatHistory = JSON.parse(historyJson);
    return [...history.sessions].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  } catch (e) {
    console.error("Error loading history:", e);
    return [];
  }
};

// Helper to get history from localStorage
const getHistory = (): ChatHistory => {
  if (typeof window === "undefined") return { sessions: [], currentSessionId: null };
  const historyJson = localStorage.getItem("chatHistory");
  return historyJson ? JSON.parse(historyJson) : { sessions: [], currentSessionId: null };
};

// Helper to save history to localStorage
const saveHistory = (history: ChatHistory) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("chatHistory", JSON.stringify(history));
};

export default function History() {
  // Initialize with empty array to prevent hydration mismatch
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load sessions after component mounts (client-side only)
  // This prevents hydration mismatch by loading data after initial render
  // Note: This is intentional use of useEffect to load from localStorage (same pattern as Chat.tsx)
  useEffect(() => {
    // Use setTimeout to avoid linter warning (same pattern as useOnline.ts)
    const timeoutId = setTimeout(() => {
      setIsMounted(true);
      const loaded = loadSessionsFromStorage();
      if (loaded.length > 0) {
        console.log("📚 [History.tsx] Załadowano", loaded.length, "sesji");
      }
      setSessions(loaded);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSessionClick = (sessionId: string) => {
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
    try {
      const history = getHistory();
      history.sessions = history.sessions.filter((s) => s.id !== sessionId);
      // If we're deleting the current session, clear it but stay on history page
      if (history.currentSessionId === sessionId) {
        history.currentSessionId = null;
      }
      saveHistory(history);
      // Update local state to reflect the deletion
      setSessions(history.sessions.sort((a, b) => b.lastMessageAt - a.lastMessageAt));
      console.log("🗑️ [History.tsx] Sesja usunięta, pozostajemy na stronie historii");
    } catch (e) {
      console.error("Error deleting session:", e);
    }
  };

  const getSessionDescription = (session: ChatSession): string => session.topic || "Brak tematu";

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto" suppressHydrationWarning>
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-8 mt-8">Historia rozmów</h1>

      {/* Session list */}
      <ul className="flex-1 space-y-4 mb-8" suppressHydrationWarning>
        {!isMounted ? (
          <li className="text-center text-gray-500 py-12">
            <p className="text-sm">Ładowanie...</p>
          </li>
        ) : sessions.length === 0 ? (
          <li className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">📭 Brak historii rozmów</p>
            <p className="text-sm">Rozpocznij nową rozmowę, aby utworzyć historię</p>
          </li>
        ) : (
          sessions.map((session) => {
            const titleId = `session-title-${session.id}`;
            const descriptionId = `session-description-${session.id}`;

            return (
              <li key={session.id}>
                <Card
                  onClick={() => handleSessionClick(session.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSessionClick(session.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  className="cursor-pointer hover:shadow-lg transition-shadow focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <CardContent className="flex items-center gap-4 p-4 md:p-6">
                    {/* User avatar */}
                    <Avatar className="w-12 h-12 shrink-0 bg-blue-100">
                      <AvatarFallback className="text-2xl bg-blue-100">
                        {session.avatar ? (
                          <span>{session.avatar}</span>
                        ) : (
                          <img src={UserIcon} alt="" width={24} height={24} className="w-6 h-6" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Title and description */}
                    <div className="flex-1 min-w-0">
                      <CardHeader className="p-0">
                        <CardTitle id={titleId} className="text-base mb-1">
                          {session.name}
                        </CardTitle>
                        <CardDescription id={descriptionId} className="line-clamp-2">
                          {getSessionDescription(session)}
                        </CardDescription>
                      </CardHeader>
                      <div className="flex gap-3 mt-2 text-xs text-gray-400">
                        <span>💬 {session.messages.filter((m) => m.role !== "system").length} wiadomości</span>
                        <span>🎫 {session.tokensUsed.toLocaleString()} tokenów</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="text-red-500 hover:text-red-700 p-2"
                            aria-label="Usuń rozmowę"
                          >
                            🗑️
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Usuń rozmowę</AlertDialogTitle>
                            <AlertDialogDescription>
                              Czy na pewno chcesz usunąć tę rozmowę? Tej operacji nie można cofnąć.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Anuluj</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                            >
                              Usuń
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <img
                        src={ChevronRightIcon}
                        alt=""
                        width={20}
                        height={20}
                        className="w-5 h-5 text-gray-600"
                        aria-hidden="true"
                      />
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })
        )}
      </ul>

      {/* Back button */}
      <div className="flex justify-center mb-6">
        <a href="/" className={buttonVariants({ variant: "back" })}>
          <img src={ArrowLeftSimpleIcon} alt="" width={20} height={20} className="w-5 h-5" aria-hidden="true" />
          wróć
        </a>
      </div>
    </div>
  );
}
