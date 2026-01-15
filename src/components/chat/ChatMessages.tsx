import type { RefObject } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import type { Message } from "../../agents/mathTutor/types";
import { cleanMathNotation } from "./chatUtils";

type ChatMessagesProps = {
  messages: Message[];
  isLoading: boolean;
  studentAvatar?: string;
  messagesEndRef: RefObject<HTMLDivElement>;
};

const MessageBubble = ({ message, studentAvatar }: { message: Message; studentAvatar?: string }) => {
  if (message.role === "assistant") {
    return (
      <div className="flex items-start gap-3">
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

  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%]">
        <p className="text-sm font-semibold text-white mb-1">Ty</p>
        <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
      </div>
      <Avatar className="w-10 h-10 shrink-0 bg-blue-100">
        <AvatarFallback className="text-2xl bg-blue-100">{studentAvatar || "🦊"}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default function ChatMessages({ messages, isLoading, studentAvatar, messagesEndRef }: ChatMessagesProps) {
  return (
    <div
      className="flex-1 space-y-4 mb-4 overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-busy={isLoading}
      aria-label="Wiadomości czatu"
    >
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Postaram się to wytłumaczyć w sposób, który będzie dla Ciebie zrozumiały</p>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble key={`${message.role}-${index}`} message={message} studentAvatar={studentAvatar} />
      ))}

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

      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
