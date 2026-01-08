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

  describe("TEST 3: Walidacja limitu wiadomości", () => {
    it("should disable Send button and show red border when message length >= 400", async () => {
      localStorage.setItem(
        "studentData",
        JSON.stringify({
          name: "Test User",
          subject: "matematyka",
          topic: "algebra",
        })
      );

      render(<Chat />);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/wpisz pytanie/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/wpisz pytanie/i);
      const sendButton = screen.getByLabelText(/send message/i);

      // Test with short message - should be enabled
      await userEvent.type(textarea, "Short message");

      await waitFor(() => {
        expect(sendButton).not.toBeDisabled();
      });

      // Clear and test with 400 characters - should be disabled
      await userEvent.clear(textarea);
      const text400 = "a".repeat(400);
      await userEvent.paste(text400);

      await waitFor(
        () => {
          expect(sendButton).toBeDisabled();
          expect(screen.queryByText(/400 \/ 400/)).toBeInTheDocument();
          expect(textarea).toHaveClass("border-red-500");
        },
        { timeout: 5000 }
      );
    });
  });

  describe("TEST 10: Licznik znaków", () => {
    it("should show character counter that updates dynamically", async () => {
      localStorage.setItem(
        "studentData",
        JSON.stringify({
          name: "Test User",
          subject: "matematyka",
          topic: "algebra",
        })
      );

      render(<Chat />);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/wpisz pytanie/i)).toBeInTheDocument();
      });

      // Initial state - should show "0 / 400"
      expect(screen.getByText("0 / 400")).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/wpisz pytanie/i);

      // Type few characters
      await userEvent.type(textarea, "Hi");

      await waitFor(() => {
        expect(screen.queryByText(/2 \/ 400/)).toBeInTheDocument();
      });
    });

    it("should show red counter and disable button when at limit", async () => {
      localStorage.setItem(
        "studentData",
        JSON.stringify({
          name: "Test User",
          subject: "matematyka",
          topic: "algebra",
        })
      );

      render(<Chat />);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/wpisz pytanie/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/wpisz pytanie/i);
      const sendButton = screen.getByLabelText(/send message/i);

      // Directly set value to test validation without slow typing
      const text400 = "a".repeat(400);
      await userEvent.click(textarea);
      await userEvent.paste(text400);

      await waitFor(
        () => {
          // Counter should show 400 / 400 in red
          const counter = screen.queryByText(/400 \/ 400/);
          expect(counter).toBeInTheDocument();
          if (counter) {
            expect(counter).toHaveClass("text-red-500");
          }
          // Send button should be disabled
          expect(sendButton).toBeDisabled();
        },
        { timeout: 5000 }
      );
    });
  });

  describe("TEST 11: Textarea wieloliniowa", () => {
    it("should handle Shift+Enter for new line and Enter for sending", async () => {
      localStorage.setItem(
        "studentData",
        JSON.stringify({
          name: "Test User",
          subject: "matematyka",
          topic: "algebra",
        })
      );

      const user = userEvent.setup();
      render(<Chat />);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/wpisz pytanie/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/wpisz pytanie/i) as HTMLTextAreaElement;

      // Type "Line 1"
      await user.type(textarea, "Line 1");

      await waitFor(() => {
        expect(textarea.value).toBe("Line 1");
      });

      // Simulate Shift+Enter (adds new line, doesn't send)
      await user.keyboard("{Shift>}{Enter}{/Shift}");

      // Type "Line 2"
      await user.type(textarea, "Line 2");

      // Check if textarea contains newline character
      await waitFor(() => {
        expect(textarea.value).toContain("\n");
        expect(textarea.value).toBe("Line 1\nLine 2");
      });

      // Verify message was NOT sent (no fetch call yet, only the initial greeting)
      const fetchCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;

      // Press Enter (without Shift) - should send message
      await user.keyboard("{Enter}");

      // Wait for message to be sent (one more fetch call than before)
      await waitFor(() => {
        expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(fetchCalls);
      });
    });
  });
});
