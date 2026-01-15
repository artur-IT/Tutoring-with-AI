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
  tokensUsed,
  tokenLimit,
}: ChatStatsProps) {
  const maxSessionSeconds = maxSessionDurationMinutes * 60;
  return (
    <div className="mb-4 space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-400 italic">pozostałe zapytania</p>
          <p className="text-xs text-gray-500">
            {remainingRequests} / {maxMessagesPerSession}
          </p>
        </div>
        <Progress
          value={(remainingRequests / maxMessagesPerSession) * 100}
          className={`h-2 ${remainingRequests / maxMessagesPerSession > 0.2 ? "[&>div]:bg-blue-600" : "[&>div]:bg-red-500"}`}
        />
        {remainingRequests === 0 && (
          <p className="text-xs text-red-600 mt-1">⚠️ Osiągnięto limit zapytań dla tej sesji</p>
        )}
        {remainingRequests > 0 && remainingRequests <= maxMessagesPerSession * 0.2 && (
          <p className="text-xs text-yellow-600 mt-1">⚠️ Zostało niewiele zapytań</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-400 italic">czas sesji</p>
          <p className="text-xs text-gray-500">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
          </p>
        </div>
        <Progress
          value={(timeRemaining / maxSessionSeconds) * 100}
          className={`h-2 ${timeRemaining / maxSessionSeconds > 0.2 ? "[&>div]:bg-green-600" : "[&>div]:bg-red-500"}`}
        />
        {timeRemaining <= 0 && <p className="text-xs text-red-600 mt-1">⚠️ Czas sesji minął</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-400 italic">wykorzystane tokeny</p>
          <p className="text-xs text-gray-500">
            {tokensUsed.toLocaleString()} / {tokenLimit.toLocaleString()}
          </p>
        </div>
        <Progress
          value={Math.min((tokensUsed / tokenLimit) * 100, 100)}
          className={`h-2 ${tokensUsed / tokenLimit < 0.7 ? "[&>div]:bg-blue-600" : tokensUsed / tokenLimit < 0.9 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"}`}
        />
        {tokensUsed >= tokenLimit && (
          <p className="text-xs text-red-600 mt-1">⚠️ Osiągnięto limit tokenów dla tej sesji</p>
        )}
      </div>
    </div>
  );
}
