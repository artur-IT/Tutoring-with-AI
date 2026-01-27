import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
import { getHistory, saveHistory } from "../lib/chatHistory";

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

const FADE_OUT_DURATION = 400; // ms

export default function History() {
  // Initialize with empty array to prevent hydration mismatch
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  useEffect(() => {
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
    // Don't navigate if session is being deleted
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
    // Start fade-out animation
    setDeletingSessionId(sessionId);

    // Wait for animation to complete, then remove from state
    setTimeout(() => {
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
        setDeletingSessionId(null);
        console.log("🗑️ [History.tsx] Sesja usunięta, pozostajemy na stronie historii");
      } catch (e) {
        console.error("Error deleting session:", e);
        setDeletingSessionId(null);
      }
    }, FADE_OUT_DURATION);
  };

  const getSessionDescription = (session: ChatSession): string => session.topic || "Brak tematu";

  return (
    <div
      className="min-h-dvh bg-background flex flex-col p-4 md:p-6 max-w-3xl mx-auto overflow-y-auto"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))" }}
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="text-center mb-10 mt-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="text-4xl mb-4">📖</div>
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Twoje <span className="text-primary">rozmowy</span>
        </h1>
        <p className="text-base text-muted-foreground">Przejrzyj swoje sesje nauki</p>
      </div>

      {/* Session list */}
      <ul className="flex-1 space-y-4 mb-12" suppressHydrationWarning>
        {!isMounted ? (
          <li className="text-center text-gray-600 py-16">
            <p className="text-sm">Ładowanie twoich rozmów...</p>
          </li>
        ) : sessions.length === 0 ? (
          <li className="text-center py-20">
            <div className="text-6xl mb-4" role="img" aria-label="Książka">
              📚
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gotowy na pierwszą lekcję?</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Rozpocznij rozmowę z korepetytorem i zobacz jak łatwo można zrozumieć trudne tematy
            </p>
            <a href="/tutors" className={buttonVariants({ variant: "ok" })}>
              Rozpocznij naukę
            </a>
          </li>
        ) : (
          sessions.map((session) => {
            const titleId = `session-title-${session.id}`;
            const descriptionId = `session-description-${session.id}`;

            return (
              <li
                key={session.id}
                className={cn(
                  "transition-all duration-400 ease-out",
                  deletingSessionId === session.id && "opacity-0 scale-95 -translate-x-4"
                )}
              >
                <Card
                  onClick={() => handleSessionClick(session.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSessionClick(session.id);
                    }
                  }}
                  role="button"
                  tabIndex={deletingSessionId === session.id ? -1 : 0}
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  className={cn(
                    "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in slide-in-from-bottom-2",
                    deletingSessionId === session.id && "pointer-events-none"
                  )}
                  style={{ animationDelay: `${sessions.indexOf(session) * 50}ms` }}
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
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:scale-130 transition-transform min-w-[64px] min-h-[64px]"
                            aria-label="Usuń rozmowę"
                          >
                            🗑️
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Usunąć tę rozmowę?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ta rozmowa zostanie trwale usunięta. Nie będzie można jej przywrócić.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Zachowaj rozmowę</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                            >
                              Usuń na zawsze
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
      <div className="flex justify-center pb-6 pb-safe shrink-0">
        <a
          href="/"
          className={cn(buttonVariants({ variant: "back" }), "text-sm px-4 py-2 md:text-base md:px-6 md:py-3")}
        >
          <img src={ArrowLeftSimpleIcon} alt="" width={20} height={20} className="w-5 h-5" aria-hidden="true" />
          Strona główna
        </a>
      </div>
    </div>
  );
}
