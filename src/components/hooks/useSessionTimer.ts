import { useState, useEffect, useRef, useCallback } from "react";
import { sessionLimits } from "../../agents/mathTutor/config";

export function useSessionTimer(onTimeout: () => void) {
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(sessionLimits.maxSessionDuration * 60);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    const startTime = Date.now();
    setSessionStartTime(startTime);
    setTimeRemaining(sessionLimits.maxSessionDuration * 60);
    setIsSessionEnded(false);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  const endSession = useCallback(() => {
    if (isSessionEnded) return;
    setIsSessionEnded(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, [isSessionEnded]);

  useEffect(() => {
    if (!sessionStartTime || isSessionEnded) return;

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const remaining = Math.max(0, sessionLimits.maxSessionDuration * 60 - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        endSession();
        onTimeout();
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionStartTime, isSessionEnded, endSession, onTimeout]);

  return {
    timeRemaining,
    isSessionEnded,
    startTimer,
    endSession,
  };
}
