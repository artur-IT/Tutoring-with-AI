import { useState, useEffect } from "react";
import { useOnline } from "./hooks/useOnline";
import { Alert, AlertDescription } from "./ui/alert";
import { WifiOff } from "lucide-react";

/**
 * OfflineIndicator Component
 * Shows a warning message when the user is offline
 */
export function OfflineIndicator() {
  const isOnline = useOnline();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render during SSR or if online
  if (!isMounted || isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Alert variant="destructive" className="shadow-lg">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>Jesteś offline. Niektóre funkcje mogą być niedostępne.</AlertDescription>
      </Alert>
    </div>
  );
}
