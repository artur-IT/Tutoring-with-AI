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

  // Check if we're in dev mode (localhost or 127.0.0.1)
  const isDevMode =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("localhost"));

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

    // In dev mode, simulate the install prompt for testing
    if (isDevMode) {
      // Create a mock event for testing
      const mockEvent = {
        preventDefault: () => {},
        prompt: async () => {
          console.log("?? DEV MODE: Install prompt would be shown here");
          // Simulate user accepting after a delay
          await new Promise((resolve) => setTimeout(resolve, 100));
        },
        userChoice: Promise.resolve({ outcome: "accepted" as const, platform: "web" }),
      } as BeforeInstallPromptEvent;

      // Show button after a short delay in dev mode
      const timer = setTimeout(() => {
        setDeferredPrompt(mockEvent);
        setIsVisible(true);
        console.log("?? DEV MODE: PWA Install button is visible for testing");
      }, 1000);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isDismissed, isHomePage, isDevMode]);

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
        if (isDevMode) {
          console.log("?? DEV MODE: Installation accepted (simulated)");
        }
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
        "fixed top-4 right-4 z-50",
        "inline-flex items-center justify-center gap-1.5",
        "rounded-lg text-xs font-medium transition-all",
        "bg-background text-primary hover:bg-muted",
        "border border-primary shadow-sm hover:shadow-md",
        "px-3 py-1.5 active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "print:hidden"
      )}
      aria-label="Zainstaluj aplikacj?"
      type="button"
    >
      <DownloadIcon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Zainstaluj</span>
    </button>
  );
}
