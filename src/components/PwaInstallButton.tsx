import { useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PwaInstallButton() {
  const [isHomePage, setIsHomePage] = useState(() => {
    if (typeof window === "undefined") return false;
    const pathname = window.location.pathname;
    return pathname === "/" || pathname === "/index.html";
  });

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

  const isDevMode =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("localhost"));

  useEffect(() => {
    const checkHomePage = () => {
      const pathname = window.location.pathname;
      setIsHomePage(pathname === "/" || pathname === "/index.html");
    };

    checkHomePage();

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
      e.preventDefault();
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

    if (isDevMode) {
      const mockEvent = {
        preventDefault: () => {},
        prompt: async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
        },
        userChoice: Promise.resolve({ outcome: "accepted" as const, platform: "web" }),
      } as BeforeInstallPromptEvent;

      const timer = setTimeout(() => {
        setDeferredPrompt(mockEvent);
        setIsVisible(true);
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
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem("pwa-install-dismissed", "true");
      }
    } catch (error) {
      console.error("Error showing install prompt:", error);
    } finally {
      setDeferredPrompt(null);
    }
  };

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
