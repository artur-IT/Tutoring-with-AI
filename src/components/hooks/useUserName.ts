import { useState, useEffect } from "react";

const STORAGE_KEY = "userName";
const EVENT_NAME = "nameUpdated";

export function useUserName() {
  const [name, setName] = useState<string>("");

  // Sync state from localStorage after hydration
  useEffect(() => {
    const storedName = localStorage.getItem(STORAGE_KEY);
    if (storedName) setTimeout(() => setName(storedName), 0);
  }, []);

  useEffect(() => {
    const handleNameUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ name: string }>;
      if (customEvent.detail?.name) {
        setName(customEvent.detail.name);
      }
    };

    window.addEventListener(EVENT_NAME, handleNameUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleNameUpdate);
  }, []);

  const saveName = (newName: string): boolean => {
    const trimmedName = newName.trim();
    if (!trimmedName) return false;

    localStorage.setItem(STORAGE_KEY, trimmedName);
    setName(trimmedName);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { name: trimmedName } }));
    return true;
  };

  return { name, setName, saveName };
}
