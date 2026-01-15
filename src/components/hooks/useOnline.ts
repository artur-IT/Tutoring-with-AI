import { useContext } from "react";
import { OnlineContext } from "./OnlineProvider";

/**
 * Hook to access global online/offline status
 * Must be used within OnlineProvider
 */
export function useOnline(): boolean {
  const context = useContext(OnlineContext);

  if (context === undefined) {
    throw new Error("useOnline must be used within OnlineProvider");
  }

  return context.isOnline;
}
