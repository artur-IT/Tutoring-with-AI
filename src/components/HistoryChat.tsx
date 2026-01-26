import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import type { ChatHistory, ChatSession, Message } from "../agents/mathTutor/types";
import { cleanMathNotation } from "./chat/chatUtils";
import { sanitizeForDisplay } from "../lib/contentFilter";

const getHistory = (): ChatHistory => {
  if (typeof window === "undefined") return { sessions: [], currentSessionId: null };
  const historyJson = localStorage.getItem("chatHistory");
  return historyJson ? JSON.parse(historyJson) : { sessions: [], currentSessionId: null };
};

const findSession = (history: ChatHistory): ChatSession | null => {
  if (!history.currentSessionId) return null;
  return history.sessions.find((session) => session.id === history.currentSessionId) || null;
};

const renderMessage = (message: Message, avatar: string | undefined, index: number) => {
  // Sanitize all message content before displaying
  const sanitizedContent = sanitizeForDisplay(message.content);

  if (message.role === "assistant") {
    return (
      <div key={`assistant-${index}`} className="flex items-start gap-3">
        <Avatar className="w-10 h-10 shrink-0 bg-amber-100">
          <AvatarFallback className="text-2xl bg-amber-100">👨‍🏫</AvatarFallback>
        </Avatar>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 max-w-[80%]">
          <p className="text-sm font-semibold text-gray-950 mb-1">Korepetytor</p>
          <p className="text-sm text-gray-950 whitespace-pre-wrap">{cleanMathNotation(sanitizedContent)}</p>
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div key={`user-${index}`} className="flex items-start gap-3 justify-end">
        <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%]">
          <p className="text-sm font-semibold text-white mb-1">Ty</p>
          <p className="text-sm text-white whitespace-pre-wrap">{sanitizedContent}</p>
        </div>
        <Avatar className="w-10 h-10 shrink-0 bg-blue-100">
          <AvatarFallback className="text-2xl bg-blue-100">{avatar || "🦊"}</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return null;
};

export default function HistoryChat() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMounted(true);
      const history = getHistory();
      setSession(findSession(history));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-dvh bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto">
        <div className="text-center text-gray-600 py-16">
          <p className="text-sm">Ładowanie rozmowy...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto">
        <div className="text-center py-16">
          <div className="text-5xl mb-4" role="img" aria-label="Szukanie">
            🔍
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nie znaleziono rozmowy</h2>
          <p className="text-sm text-gray-600 mb-6">Wróć do listy i wybierz rozmowę, którą chcesz przejrzeć</p>
          <a href="/history-list" className={buttonVariants({ variant: "ok" })}>
            Zobacz wszystkie rozmowy
          </a>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="history-chat-print min-h-dvh bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto overflow-y-auto">
      <header className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Twoja rozmowa</h1>
          {session.name && <p className="text-sm text-gray-600 mt-1">{session.name}</p>}
        </div>
        <div className="flex gap-2 print:hidden">
          <a href="/history-list" className={cn(buttonVariants({ variant: "back" }), "text-sm px-3 py-2")}>
            Wszystkie rozmowy
          </a>
          <button
            type="button"
            onClick={handlePrint}
            className={cn(buttonVariants({ variant: "outline" }), "p-2 min-w-[40px]")}
            aria-label="Drukuj rozmowę"
          >
            <Printer className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 mb-4 overflow-y-auto" role="region" aria-label="Wiadomości historii">
        {session.messages.length === 0 && (
          <div className="text-center text-gray-600 mt-16">
            <div className="text-5xl mb-4" role="img" aria-label="Pusta rozmowa">
              💬
            </div>
            <p className="text-base text-gray-900">Ta rozmowa nie zawiera wiadomości</p>
          </div>
        )}

        {session.messages.map((message, index) => renderMessage(message, session.avatar, index))}
      </div>

      <footer className="hidden print:block text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
        Wydrukowano: {new Date().toLocaleString("pl-PL", { dateStyle: "long", timeStyle: "short" })}
      </footer>
    </div>
  );
}
