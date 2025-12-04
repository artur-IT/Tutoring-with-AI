import { useState, useCallback } from "react";

const STORAGE_KEY = "userName";
const EVENT_NAME = "nameUpdated";

/* Custom hook for managing user name in localStorage */
export function useUserName() {
  const [name, setName] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY) || "";
  });

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
