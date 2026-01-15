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
    // Test actual network connectivity using Image API (doesn't pollute console)
    const checkOnlineStatus = () => {
      // First check navigator.onLine - if false, we're definitely offline
      if (!navigator.onLine) {
        console.log("🌐 navigator.onLine = false → OFFLINE");
        setIsOnline(false);
        return;
      }

      // If navigator.onLine is true, verify with actual network request using Image
      // This method doesn't generate console errors when offline
      const img = new Image();
      const timeout = setTimeout(() => {
        img.src = "";
        console.log("🌐 Connection test: TIMEOUT → OFFLINE");
        setIsOnline(false);
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        console.log("🌐 Connection test: SUCCESS → ONLINE");
        setIsOnline(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        console.log("🌐 Connection test: FAILED → OFFLINE");
        setIsOnline(false);
      };

      // Use favicon with cache-busting timestamp
      img.src = "/favicon.png?t=" + Date.now();
    };

    const handleOnline = () => {
      console.log("✅ Online event fired, verifying...");
      checkOnlineStatus();
    };

    const handleOffline = () => {
      console.log("❌ Offline event fired");
      setIsOnline(false);
    };

    // Initial status check
    checkOnlineStatus();

    // Listen to browser online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen to View Transitions events to re-check status
    const handlePageSwap = () => {
      console.log("🔄 View transition detected, checking status...");
      checkOnlineStatus();
    };

    document.addEventListener("astro:page-load", handlePageSwap);

    // Periodic check as fallback (every 10 seconds)
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
