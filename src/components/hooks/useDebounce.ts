import { useRef, useCallback } from "react";

export function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (isExecutingRef.current) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        isExecutingRef.current = true;
        callback(...args);
        setTimeout(() => {
          isExecutingRef.current = false;
        }, 100);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedFunction;
}
