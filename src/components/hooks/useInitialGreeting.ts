import { useCallback } from "react";
import type { Message, StudentData, AIResponse } from "../../agents/mathTutor/types";

interface UseInitialGreetingParams {
  studentData: StudentData | null;
  currentSessionId: string | null;
  setMessages: (messages: Message[]) => void;
  setTokensUsed: (tokens: number) => void;
  setRemainingRequests: (requests: number) => void;
  setShouldSaveSession: (should: boolean) => void;
  removeCurrentSessionFromHistory: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialGreetingSentRef: React.MutableRefObject<boolean>;
}

export function useInitialGreeting({
  studentData,
  currentSessionId,
  setMessages,
  setTokensUsed,
  setRemainingRequests,
  setShouldSaveSession,
  removeCurrentSessionFromHistory,
  setIsLoading,
  setError,
  initialGreetingSentRef,
}: UseInitialGreetingParams) {
  const sendInitialGreeting = useCallback(async () => {
    if (initialGreetingSentRef.current) return;
    initialGreetingSentRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const initialPrompt = studentData?.problem
        ? `Cześć! Mam problem z: ${studentData.problem}. Możesz mi to wytłumaczyć?`
        : `Cześć! Chciałbym nauczyć się matematyki.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: initialPrompt,
          history: [],
          studentData,
          subject: studentData?.subject || "matematyka",
          sessionId: currentSessionId,
        }),
      });

      const data: AIResponse = await response.json();

      if (data.rateLimit) setRemainingRequests(data.rateLimit.remaining);

      if (data.success && data.response) {
        const aiMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages([aiMessage]);

        if (data.metadata?.tokens) setTokensUsed(data.metadata.tokens);

        if (data.shouldRedirect) {
          setShouldSaveSession(false);
          removeCurrentSessionFromHistory();
          localStorage.removeItem("studentData");
          setTimeout(() => window.location.replace("/tutors"), 8000);
        }
      } else {
        console.error("Błąd w automatycznym powitaniu:", data.error);
        setError(data.error || "Wystąpił błąd podczas rozpoczynania rozmowy");
        initialGreetingSentRef.current = false;
      }
    } catch (err) {
      console.error("Initial greeting error:", err);
      setError("Nie można połączyć się z serwerem");
      initialGreetingSentRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [
    studentData,
    currentSessionId,
    setMessages,
    setTokensUsed,
    setRemainingRequests,
    setShouldSaveSession,
    removeCurrentSessionFromHistory,
    setIsLoading,
    setError,
    initialGreetingSentRef,
  ]);

  return { sendInitialGreeting };
}
