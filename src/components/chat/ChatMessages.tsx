import type { RefObject } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import type { Message } from "../../agents/mathTutor/types";
import { cleanMathNotation } from "./chatUtils";
import { sanitizeForDisplay } from "../../lib/contentFilter";

// Playful loading messages for teenagers - cycle through based on number of messages
const LOADING_MESSAGES = [
  "Myślę nad odpowiedzią...",
  "Szukam najlepszego wyjaśnienia...",
  "Przygotowuję przykłady...",
  "Rozważam różne sposoby tłumaczenia...",
  "Budzę neurony AI...",
  "Konsultuję się z matematycznym duchem...",
  "Układam odpowiedź specjalnie dla Ciebie...",
  "Sprawdzam kilka podejść...",
] as const;

type ChatMessagesProps = {
  messages: Message[];
  isLoading: boolean;
  studentAvatar?: string;
  messagesEndRef: RefObject<HTMLDivElement>;
};

const MessageBubble = ({ message, studentAvatar }: { message: Message; studentAvatar?: string }) => {
  // Sanitize all message content before displaying
  const sanitizedContent = sanitizeForDisplay(message.content);

  if (message.role === "assistant") {
    return (
      <div className="flex items-start gap-3 min-w-0">
        <Avatar className="w-10 h-10 shrink-0 bg-amber-100">
          <AvatarFallback className="text-2xl bg-amber-100">👨‍🏫</AvatarFallback>
        </Avatar>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 max-w-[80%] min-w-0 wrap-break-word overflow-hidden">
          <p className="text-sm font-semibold text-gray-950 mb-1">Korepetytor</p>
          <p className="text-sm text-gray-950 whitespace-pre-wrap wrap-break-word">
            {cleanMathNotation(sanitizedContent)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 justify-end min-w-0">
      <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%] min-w-0 wrap-break-word overflow-hidden">
        <p className="text-sm font-semibold text-white mb-1">Ty</p>
        <p className="text-sm text-white whitespace-pre-wrap wrap-break-word">{sanitizedContent}</p>
      </div>
      <Avatar className="w-10 h-10 shrink-0 bg-blue-100">
        <AvatarFallback className="text-2xl bg-blue-100">{studentAvatar || "🦊"}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default function ChatMessages({ messages, isLoading, studentAvatar, messagesEndRef }: ChatMessagesProps) {
  // Cycle through loading messages based on message count for variety
  const loadingMessage = LOADING_MESSAGES[messages.length % LOADING_MESSAGES.length];

  return (
    <div
      className="flex-1 space-y-4 mb-4 overflow-y-auto overflow-x-hidden"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-busy={isLoading}
      aria-label="Wiadomości czatu"
    >
      {messages.length === 0 && (
        <div className="text-center text-muted-foreground mt-12 animate-in fade-in duration-500">
          <div className="text-5xl mb-4 animate-[wiggle_2s_ease-in-out_infinite]" role="img" aria-label="Korepetytor">
            👨‍🏫
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">Hej! Jestem gotowy.</p>
          <p className="text-base text-muted-foreground">
            Zaraz dostaniesz wyjaśnienie dostosowane do Twoich zainteresowań
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble key={`${message.role}-${index}`} message={message} studentAvatar={studentAvatar} />
      ))}

      {isLoading && (
        <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Avatar className="w-12 h-12 shrink-0 bg-accent/20 animate-[pulse-slow_2s_ease-in-out_infinite]">
            <AvatarFallback className="text-2xl bg-accent/20">👨‍🏫</AvatarFallback>
          </Avatar>
          <div className="bg-accent/10 border border-accent/30 rounded-2xl px-4 py-3 space-y-2">
            <p className="text-sm font-medium text-foreground animate-[pulse-slow_2s_ease-in-out_infinite]">
              {loadingMessage}
            </p>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
