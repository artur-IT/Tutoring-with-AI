import { createContext, useEffect, useState, type ReactNode } from "react";

interface OnlineContextValue {
  isOnline: boolean;
}

export const OnlineContext = createContext<OnlineContextValue | undefined>(undefined);

interface OnlineProviderProps {
  children: ReactNode;
}

/**
 * Global provider for online/offline status
 * Single source of truth for network connectivity across the app
 */
export function OnlineProvider({ children }: OnlineProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof window === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const checkOnlineStatus = () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }

      const img = new Image();
      const timeout = setTimeout(() => {
        img.src = "";
        setIsOnline(false);
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        setIsOnline(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        setIsOnline(false);
      };

      img.src = "/favicon.png?t=" + Date.now();
    };

    const handleOnline = () => checkOnlineStatus();
    const handleOffline = () => setIsOnline(false);

    checkOnlineStatus();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handlePageSwap = () => checkOnlineStatus();

    document.addEventListener("astro:page-load", handlePageSwap);

    const intervalId = setInterval(checkOnlineStatus, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("astro:page-load", handlePageSwap);
      clearInterval(intervalId);
    };
  }, []);

  return <OnlineContext.Provider value={{ isOnline }}>{children}</OnlineContext.Provider>;
}
