import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Chat from "./Chat";

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
const mockLocation = {
  href: "",
  replace: vi.fn(),
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe("Chat Component - Edge Cases", () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    vi.clearAllMocks();
    localStorage.clear();
    mockLocation.href = "";

    // Mock successful API response by default
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        response: "Test response",
        rateLimit: {
          remaining: 49,
          limit: 50,
        },
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("TEST 1: Pusta wiadomość", () => {
    it("should disable Send button when input is empty", async () => {
      // Set up student data in localStorage
      localStorage.setItem(
        "studentData",
        JSON.stringify({
          name: "Test User",
          subject: "matematyka",
          topic: "algebra",
        })
      );

      render(<Chat />);

      // Wait for component to initialize
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/wpisz pytanie/i)).toBeInTheDocument();
      });

      // Find input and send button
      const input = screen.getByPlaceholderText(/wpisz pytanie/i);
      const sendButton = screen.getByLabelText(/send message/i);

      // Check that button is disabled when input is empty
      expect(input).toHaveValue("");
      expect(sendButton).toBeDisabled();

      // Type text
      await userEvent.type(input, "Test message");

      // Check that button is enabled when input has text
      await waitFor(() => {
        expect(sendButton).not.toBeDisabled();
      });

      // Clear input
      await userEvent.clear(input);

      // Check that button is disabled again
      await waitFor(() => {
        expect(sendButton).toBeDisabled();
      });
    });
  });

  describe("TEST 2: Błąd API", () => {
    it("should display friendly error message when API returns error", async () => {
      // Set up student data in localStorage
      localStorage.setItem(
        "studentData",
        JSON.stringify({
          name: "Test User",
          subject: "matematyka",
          topic: "algebra",
        })
      );

      // Mock API error response
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: "Wystąpił błąd serwera. Spróbuj ponownie później.",
        }),
      });

      render(<Chat />);

      // Wait for component to initialize
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/wpisz pytanie/i)).toBeInTheDocument();
      });

      // Find input and send button
      const input = screen.getByPlaceholderText(/wpisz pytanie/i);
      const sendButton = screen.getByLabelText(/send message/i);

      // Type and send message
      await userEvent.type(input, "Test question");
      await userEvent.click(sendButton);

      // Wait for error message to appear
      await waitFor(
        () => {
          const errorMessage = screen.queryByText(/błąd|error/i);
          expect(errorMessage).toBeInTheDocument();
          // Check that error message is user-friendly (not technical)
          expect(errorMessage?.textContent).not.toContain("500");
          expect(errorMessage?.textContent).not.toContain("Internal Server Error");
        },
        { timeout: 3000 }
      );
    });
  });

  describe("TEST 5: Blokowanie przycisku podczas wysyłania", () => {
    it("should disable Send button during loading state", async () => {
      // Set up student data in localStorage
      localStorage.setItem(
        "studentData",
        JSON.stringify({
          name: "Test User",
          subject: "matematyka",
          topic: "algebra",
        })
      );

      // Mock delayed API response
      let resolvePromise: (value: unknown) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => delayedPromise);

      render(<Chat />);

      // Wait for component to initialize
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/wpisz pytanie/i)).toBeInTheDocument();
      });

      // Find input and send button
      const input = screen.getByPlaceholderText(/wpisz pytanie/i);
      const sendButton = screen.getByLabelText(/send message/i);

      // Type message
      await userEvent.type(input, "Test question");

      // Click send button
      await userEvent.click(sendButton);

      // Check that button is disabled during loading
      await waitFor(() => {
        expect(sendButton).toBeDisabled();
      });

      // Verify button is disabled during loading (before promise resolves)
      expect(sendButton).toBeDisabled();

      // Resolve the promise
      resolvePromise?.({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          response: "Test response",
          rateLimit: {
            remaining: 49,
            limit: 50,
          },
        }),
      });

      // Wait for loading to finish and verify button state
      // Note: After loading, input is cleared so button will be disabled due to empty input
      // This is expected behavior - we just verify it was disabled during loading
      await waitFor(
        () => {
          // After response, isLoading should be false
          // Button will be disabled because input is empty (cleared after send)
          expect(sendButton).toBeDisabled();
        },
        { timeout: 3000 }
      );
    });
  });
});
