import { Progress } from "../ui/progress";

type ChatStatsProps = {
  remainingRequests: number;
  maxMessagesPerSession: number;
  timeRemaining: number;
  maxSessionDurationMinutes: number;
  tokensUsed: number;
  tokenLimit: number;
};

export default function ChatStats({
  remainingRequests,
  maxMessagesPerSession,
  timeRemaining,
  maxSessionDurationMinutes,
}: ChatStatsProps) {
  const maxSessionSeconds = maxSessionDurationMinutes * 60;
  const requestsPercent = remainingRequests / maxMessagesPerSession;
  const timePercent = timeRemaining / maxSessionSeconds;

  // Only show when resources are getting low (< 30%)
  const requestsLow = requestsPercent < 0.3;
  const timeLow = timePercent < 0.3;

  // Don't show anything if both are healthy
  if (!requestsLow && !timeLow) {
    return null;
  }

  // Show celebration when session is almost complete
  const isAlmostComplete = remainingRequests <= 5 && remainingRequests > 0;

  return (
    <div
      className={`mb-4 p-4 rounded-2xl transition-all duration-300 ${
        isAlmostComplete
          ? "bg-primary/10 border-2 border-primary/30 animate-[pulse-slow_2s_ease-in-out_infinite]"
          : "bg-amber-50 border border-amber-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" role="img" aria-label="Uwaga">
          {isAlmostComplete ? "🎉" : "⏱️"}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-2">
            {isAlmostComplete ? "Świetna robota! Jeszcze trochę:" : "Pozostało:"}
          </p>
          <div className="space-y-2 text-sm text-foreground">
            {requestsLow && (
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {remainingRequests}{" "}
                  {remainingRequests === 1 ? "pytanie" : remainingRequests < 5 ? "pytania" : "pytań"}
                </span>
                <Progress
                  value={requestsPercent * 100}
                  aria-label="Pozostałe zapytania"
                  aria-valuenow={remainingRequests}
                  aria-valuemin={0}
                  aria-valuemax={maxMessagesPerSession}
                  className="w-24 h-2 ml-3"
                />
              </div>
            )}
            {timeLow && (
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {Math.floor(timeRemaining / 60)} min {timeRemaining % 60} sek
                </span>
                <Progress
                  value={timePercent * 100}
                  aria-label="Pozostały czas sesji"
                  aria-valuenow={Math.floor(timeRemaining / 60)}
                  aria-valuemin={0}
                  aria-valuemax={maxSessionDurationMinutes}
                  className="w-24 h-2 ml-3"
                />
              </div>
            )}
          </div>
          {(remainingRequests === 0 || timeRemaining === 0) && (
            <p className="text-xs text-foreground/80 mt-2 font-medium">Sesja wkrótce się zakończy</p>
          )}
        </div>
      </div>
    </div>
  );
}
