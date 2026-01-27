import { useRef, useCallback } from "react";

/**
 * Custom hook for debouncing function calls
 * Prevents rapid successive calls by enforcing a delay between executions
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced function that can be called multiple times but executes only after delay
 *
 * @example
 * const debouncedSend = useDebounce(() => handleSend(), 500);
 * // Calling debouncedSend() multiple times will only execute once after 500ms
 */
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
