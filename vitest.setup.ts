import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
  // Clear localStorage after each test
  localStorage.clear();
  // Clear all mocks
  vi.clearAllMocks();
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "",
    replace: vi.fn(),
  },
  writable: true,
});
