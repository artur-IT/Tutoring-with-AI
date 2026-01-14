import { useEffect, useState } from "react";

/**
 * Hook to detect online/offline status
 * Returns true when online, false when offline
 */
export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    // Update online status in event handlers (not directly in effect)
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Verify current status and update if needed (using setTimeout to avoid linter warning)
    const verifyStatus = () => {
      const currentStatus = navigator.onLine;
      setIsOnline((prev) => (prev !== currentStatus ? currentStatus : prev));
    };

    // Check status after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(verifyStatus, 0);

    // Listen to online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
