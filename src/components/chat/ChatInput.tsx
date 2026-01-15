import type { RefObject } from "react";
import SendIcon from "../../assets/icons/send.svg?url";

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  isSessionEnded: boolean;
  isOnline: boolean;
  maxMessageLength: number;
  onChange: (value: string) => void;
  onSend: () => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
};

export default function ChatInput({
  input,
  isLoading,
  isSessionEnded,
  isOnline,
  maxMessageLength,
  onChange,
  onSend,
  textareaRef,
}: ChatInputProps) {
  return (
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
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (input.length < maxMessageLength) onSend();
              }
            }}
            disabled={isLoading || isSessionEnded || !isOnline}
            className={`w-full max-h-48 min-w-0 rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none resize-none overflow-y-auto disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
              input.length >= maxMessageLength
                ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]"
                : "border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            }`}
            aria-invalid={input.length >= maxMessageLength}
          />
          <p
            className={`text-xs mt-1 text-right ${input.length >= maxMessageLength ? "text-red-500" : "text-gray-500"}`}
          >
            {input.length} / {maxMessageLength}
          </p>
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={isLoading || !input.trim() || isSessionEnded || input.length >= maxMessageLength || !isOnline}
          className="shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <img src={SendIcon} alt="" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
