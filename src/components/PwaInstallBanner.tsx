import { useEffect, useState } from "react";
import { XIcon, DownloadIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PwaInstallBanner() {
  // Initialize dismissed state from localStorage
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed === "true") return true;
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    return false;
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setIsDismissed(true);
      localStorage.setItem("pwa-install-dismissed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem("pwa-install-dismissed", "true");
      }
    } catch (error) {
      console.error("Error showing install prompt:", error);
    } finally {
      // Clear the deferredPrompt so it can only be used once
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't render if dismissed or not visible
  if (isDismissed || !isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm",
        "bg-background border-2 border-primary rounded-xl shadow-lg",
        "p-4 animate-in fade-in slide-in-from-top-2 duration-300",
        "print:hidden"
      )}
      role="banner"
      aria-label="Zainstaluj aplikację"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <DownloadIcon className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-bold text-foreground">Zainstaluj aplikację</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Zainstaluj aplikację na swoim urządzeniu, aby uzyskać szybszy dostęp i lepsze doświadczenie.
          </p>
          <button
            onClick={handleInstallClick}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2",
              "rounded-lg text-sm font-semibold transition-all",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "px-4 py-2 shadow-md hover:shadow-lg active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Zainstaluj aplikację"
          >
            <DownloadIcon className="w-4 h-4" aria-hidden="true" />
            Zainstaluj
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className={cn(
            "shrink-0 rounded-md p-1",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "focus-visible:outline-none"
          )}
          aria-label="Zamknij baner instalacji"
          type="button"
        >
          <XIcon className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Zamknij</span>
        </button>
      </div>
    </div>
  );
}
