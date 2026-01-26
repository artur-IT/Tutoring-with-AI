import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "userName";
const EVENT_NAME = "nameUpdated";

function getInitialName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
}

/* Custom hook for managing user name in localStorage */
export function useUserName() {
  const [name, setName] = useState<string>(getInitialName);

  // Listen for name updates from other components
  useEffect(() => {
    const handleNameUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ name: string }>;
      if (customEvent.detail?.name) {
        setName(customEvent.detail.name);
      }
    };

    // Load initial name after mount (client-side only)
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem(STORAGE_KEY);
      if (storedName) setTimeout(() => setName(storedName), 0);
    }

    window.addEventListener(EVENT_NAME, handleNameUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleNameUpdate);
    };
  }, []);

  const saveName = useCallback((newName: string): boolean => {
    const trimmedName = newName.trim();
    if (!trimmedName) return false;

    localStorage.setItem(STORAGE_KEY, trimmedName);
    setName(trimmedName);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { name: trimmedName } }));
    return true;
  }, []);

  return { name, setName, saveName };
}
