import { useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PwaInstallButton() {
  // Check if we're on the home page
  const [isHomePage, setIsHomePage] = useState(() => {
    if (typeof window === "undefined") return false;
    const pathname = window.location.pathname;
    return pathname === "/" || pathname === "/index.html";
  });

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
    // Check if we're on the home page
    const checkHomePage = () => {
      const pathname = window.location.pathname;
      setIsHomePage(pathname === "/" || pathname === "/index.html");
    };

    checkHomePage();

    // Listen for navigation changes (Astro transitions)
    const handleLocationChange = () => {
      checkHomePage();
    };

    window.addEventListener("popstate", handleLocationChange);
    document.addEventListener("astro:page-load", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      document.removeEventListener("astro:page-load", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (isDismissed || !isHomePage) return;

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
  }, [isDismissed, isHomePage]);

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

  // Don't render if not on home page, dismissed, or not visible
  if (!isHomePage || isDismissed || !isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-xl text-base font-semibold transition-all",
        "bg-background text-primary hover:bg-muted",
        "border-2 border-primary shadow-sm hover:shadow-md",
        "px-6 py-3 active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      aria-label="Zainstaluj aplikację"
      type="button"
    >
      <DownloadIcon className="w-5 h-5" aria-hidden="true" />
      <span>Zainstaluj aplikację</span>
    </button>
  );
}
