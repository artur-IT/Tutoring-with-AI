import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NameInput from "./NameInput";

describe("NameInput Component - TEST 6: Walidacja imienia", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should disable submit button when name is empty", async () => {
    render(<NameInput />);

    // Open the dialog
    const triggerButton = screen.getByLabelText(/otwórz formularz wprowadzania imienia/i);
    await userEvent.click(triggerButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Find submit button
    const submitButton = screen.getByRole("button", { name: /zapisz/i });

    // Check that submit button is disabled when input is empty
    expect(submitButton).toBeDisabled();

    // Type name - use getAllByLabelText and get the input element (not the dialog title)
    const inputs = screen.getAllByLabelText(/wprowadź swoje imię/i);
    const input = inputs.find((el) => el.tagName === "INPUT") || inputs[0];
    await userEvent.type(input, "Test Name");

    // Check that submit button is enabled when input has text
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("should disable submit button when name contains only spaces", async () => {
    render(<NameInput />);

    // Open the dialog
    const triggerButton = screen.getByLabelText(/otwórz formularz wprowadzania imienia/i);
    await userEvent.click(triggerButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Find input and submit button - use getAllByLabelText and get the input element
    const inputs = screen.getAllByLabelText(/wprowadź swoje imię/i);
    const input = inputs.find((el) => el.tagName === "INPUT") || inputs[0];
    const submitButton = screen.getByRole("button", { name: /zapisz/i });

    // Type only spaces
    await userEvent.type(input, "   ");

    // Check that submit button is still disabled
    expect(submitButton).toBeDisabled();
  });

  it("should prevent form submission when name is empty", async () => {
    render(<NameInput />);

    // Open the dialog
    const triggerButton = screen.getByLabelText(/otwórz formularz wprowadzania imienia/i);
    await userEvent.click(triggerButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Find form and submit button
    // const form = screen.getByRole("dialog").querySelector("form");
    const submitButton = screen.getByRole("button", { name: /zapisz/i });

    // Try to submit form with empty input
    expect(submitButton).toBeDisabled();

    // Try clicking submit (should not work)
    await userEvent.click(submitButton);

    // Dialog should still be open (form not submitted)
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
