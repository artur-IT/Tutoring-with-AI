import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce Hook - TEST 4: Szybkie klikanie Send", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should execute function only once after delay despite multiple rapid calls", () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 500));

    // Call the debounced function 10 times rapidly
    for (let i = 0; i < 10; i++) {
      result.current();
    }

    // Function should not be called yet
    expect(mockCallback).not.toHaveBeenCalled();

    // Fast-forward time by 500ms
    vi.advanceTimersByTime(500);

    // Function should be called once
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should respect the delay of 500ms", () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 500));

    result.current();

    // Function should not be called before delay
    vi.advanceTimersByTime(499);
    expect(mockCallback).not.toHaveBeenCalled();

    // Function should be called after delay
    vi.advanceTimersByTime(1);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should clear previous timeout when called again before delay", () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 500));

    // Call first time
    result.current();
    vi.advanceTimersByTime(300);

    // Call again before first call executes
    result.current();
    vi.advanceTimersByTime(300);

    // Function should not be called yet
    expect(mockCallback).not.toHaveBeenCalled();

    // Complete the delay
    vi.advanceTimersByTime(200);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
