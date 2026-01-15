import { useEffect, useState } from "react";
import { buttonVariants } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import type { ChatHistory, ChatSession, Message } from "../agents/mathTutor/types";

const cleanMathNotation = (text: string): string =>
  text
    .replace(/\/([^/]+)\//g, "$1")
    .replace(/\\?\\\(([^)]+)\\\)/g, "$1")
    .replace(/\\?\\\[([^\]]+)\\\]/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1");

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
  if (message.role === "assistant") {
    return (
      <div key={`assistant-${index}`} className="flex items-start gap-3">
        <Avatar className="w-10 h-10 shrink-0 bg-yellow-100">
          <AvatarFallback className="text-2xl bg-yellow-100">👨‍🏫</AvatarFallback>
        </Avatar>
        <div className="bg-yellow-200 rounded-2xl px-4 py-3 max-w-[80%]">
          <p className="text-sm font-semibold text-gray-900 mb-1">Korepetytor</p>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{cleanMathNotation(message.content)}</p>
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div key={`user-${index}`} className="flex items-start gap-3 justify-end">
        <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%]">
          <p className="text-sm font-semibold text-white mb-1">Ty</p>
          <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
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
      <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto">
        <div className="text-center text-gray-500 py-12">
          <p className="text-sm">Ładowanie rozmowy...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto">
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg mb-2">Nie znaleziono rozmowy</p>
          <p className="text-sm">Wróć do historii i wybierz rozmowę ponownie</p>
        </div>
        <div className="flex justify-center mb-6">
          <a href="/history-list" className={buttonVariants({ variant: "back" })}>
            Wróć do historii
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Historia rozmowy</h1>
          {session.name && <p className="text-xs text-gray-500 mt-1">{session.name}</p>}
        </div>
        <div className="flex gap-2">
          <a href="/history-list" className={buttonVariants({ variant: "back" })}>
            Wróć
          </a>
        </div>
      </header>

      <div className="flex-1 space-y-4 mb-4 overflow-y-auto" role="region" aria-label="Wiadomości historii">
        {session.messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Brak wiadomości w tej rozmowie</p>
          </div>
        )}

        {session.messages.map((message, index) => renderMessage(message, session.avatar, index))}
      </div>
    </div>
  );
}
