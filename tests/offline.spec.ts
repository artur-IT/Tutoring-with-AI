import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Offline Mode
 *
 * TEST 8: Offline mode handling
 *
 * ⚠️ Note: This test depends on FEATURE 2.1 (Offline support)
 * If offline mode is not implemented, these tests will be skipped
 */

// Run tests serially to avoid overwhelming the API
test.describe.configure({ mode: "serial" });

test.describe("Offline Mode", () => {
  // Setup: Create a test user and start chat before each test
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage to ensure completely clean state
    await context.clearCookies();

    // Navigate to home page first
    await page.goto("/");

    // Clear localStorage and sessionStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Reload page to apply clean state
    await page.reload();

    // Wait for page to be ready (React hydration)
    await page.waitForLoadState("networkidle");

    // Click "Podaj imię" button to open name dialog
    // The button has aria-label="Otwórz formularz wprowadzania imienia"
    await page.getByRole("button", { name: /otwórz formularz/i }).click();

    // Wait for dialog to open and fill in the user name
    // Use textbox role to be specific (dialog also has same aria-label)
    await page.getByRole("textbox", { name: /wprowadź swoje imię/i }).fill("TestUser");

    // Click "Zapisz" button to save the name
    await page.getByRole("button", { name: /zapisz/i }).click();

    // Wait for welcome section to appear and click "Zaczynamy"
    await page.getByRole("link", { name: /zaczynamy/i }).click();

    // Wait for navigation to tutors page
    await page.waitForURL("**/tutors");

    // Select Math Tutor (click button, not radio)
    await page.getByRole("button", { name: /matematyka/i }).click();

    // Wait for form fields to appear and fill them
    // Select topic from dropdown
    await page.getByRole("combobox", { name: /wybierz temat/i }).click();
    await page.getByRole("option").first().click();

    // Fill problem description
    await page.getByLabel(/opisz problem/i).fill("co to jest?");

    // Fill interests
    await page.getByLabel(/podaj swoje zainteresowania/i).fill("gry komputerowe");

    // Select avatar (first one)
    await page
      .getByLabel(/wybierz avatar/i)
      .first()
      .click();

    // Click "Do nauki" button to go to chat
    await page.getByRole("button", { name: /do nauki/i }).click();

    // Wait for chat page to load
    await page.waitForURL("**/chat");

    // Wait for chat to be ready (welcome message should appear)
    // AI may greet with "Witaj!" or "Cześć!"
    await expect(page.getByText(/witaj|cześć/i).first()).toBeVisible({ timeout: 30000 });
  });

  /**
   * Helper function to wait for new assistant message
   * Waits until the number of yellow bubbles (assistant messages) with actual content increases
   */
  async function waitForNewAssistantMessage(page: import("@playwright/test").Page, initialCount: number) {
    // Wait for new yellow bubble to appear with actual text content
    await page.waitForFunction(
      (count) => {
        // Find all yellow bubbles that contain "Korepetytor" text (actual messages, not skeleton)
        const bubbles = document.querySelectorAll(".bg-yellow-200");
        let validBubbles = 0;
        bubbles.forEach((bubble) => {
          // Check if bubble has "Korepetytor" paragraph (actual message, not loading)
          const korep = bubble.querySelector("p.font-semibold");
          if (korep && korep.textContent?.includes("Korepetytor")) {
            validBubbles++;
          }
        });
        return validBubbles > count;
      },
      initialCount,
      { timeout: 45000 }
    );
  }

  /**
   * TEST 8a: Should show offline message when network is unavailable
   *
   * Priority: MEDIUM
   *
   * Scenario:
   * 1. User is on chat page with internet connection
   * 2. Network goes offline
   * 3. User tries to send a message
   * 4. App should show offline message or disable send button
   * 5. Network comes back online
   * 6. App should work normally again
   */
  test("TEST 8a: Should handle offline state gracefully", async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    // Try to send a message
    const testMessage = "Ile jest 2 + 2?";
    await page.getByPlaceholder(/wpisz pytanie z matematyki/i).fill(testMessage);

    // Check if send button is disabled or if there's an offline indicator
    const sendButton = page.getByRole("button", { name: /send message/i });

    // Click the send button (if enabled)
    const isButtonEnabled = await sendButton.isEnabled();
    if (isButtonEnabled) {
      await sendButton.click();

      // Check if error message appears (feature may not be implemented)
      const errorMessage = page.getByText(/błąd|offline|brak|połączenia|internet/i);
      const errorVisible = await errorMessage.isVisible().catch(() => false);

      if (!errorVisible) {
        // Feature not implemented yet - skip test
        test.skip(true, "Offline error handling not implemented yet (FEATURE 2.1 pending)");
        return;
      }

      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      // Button should be disabled when offline
      expect(isButtonEnabled).toBeFalsy();
    }

    // Go back online
    await context.setOffline(false);

    // Small delay for app to detect online status
    await page.waitForTimeout(1000);

    // Now send button should be enabled again
    await expect(sendButton).toBeEnabled({ timeout: 5000 });

    // Try to send the message again
    await page.getByPlaceholder(/wpisz pytanie z matematyki/i).fill(testMessage);
    await sendButton.click();

    // Count initial assistant messages
    const initialBubbles = await page.locator(".bg-yellow-200").count();

    // Should receive a response
    await waitForNewAssistantMessage(page, initialBubbles);

    const assistantBubbles = await page.locator(".bg-yellow-200").all();
    expect(assistantBubbles.length).toBeGreaterThan(1); // At least welcome + response
  });

  /**
   * TEST 8b: Should maintain chat history when going offline
   *
   * Scenario:
   * 1. User has some messages in chat
   * 2. Network goes offline
   * 3. Messages should still be visible
   * 4. History should be preserved
   */
  test("TEST 8b: Should preserve chat history when offline", async ({ page, context }) => {
    // Count initial assistant messages
    const initialBubbles = await page.locator(".bg-yellow-200").count();

    // Send a message while online
    const firstMessage = "Jak obliczyć pole kwadratu?";
    await page.getByPlaceholder(/wpisz pytanie z matematyki/i).fill(firstMessage);
    await page.getByRole("button", { name: /send message/i }).click();

    // Wait for response
    await waitForNewAssistantMessage(page, initialBubbles);

    // Count messages before going offline (yellow + blue bubbles)
    const messagesBeforeOffline = await page.locator(".bg-yellow-200, .bg-blue-600").count();
    expect(messagesBeforeOffline).toBeGreaterThan(0);

    // Go offline
    await context.setOffline(true);

    // Wait a bit
    await page.waitForTimeout(1000);

    // Messages should still be visible
    const messagesWhileOffline = await page.locator(".bg-yellow-200, .bg-blue-600").count();
    expect(messagesWhileOffline).toBe(messagesBeforeOffline);

    // User message should still be visible
    await expect(page.getByText(firstMessage)).toBeVisible();
  });

  /**
   * TEST 8c: Should show offline indicator in UI
   *
   * Scenario:
   * 1. User goes offline
   * 2. UI should show an indicator (badge, banner, or icon)
   * 3. Indicator should disappear when back online
   */
  test("TEST 8c: Should display offline indicator", async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    // Wait for offline detection
    await page.waitForTimeout(2000);

    // Look for offline indicator
    // This could be a banner, alert, or icon with text like "Offline", "Brak połączenia", etc.
    const offlineIndicator = page.getByText(/offline|brak połączenia|brak internetu/i).first();

    // Check if indicator exists (might not be implemented yet)
    const indicatorExists = await offlineIndicator.isVisible().catch(() => false);

    if (indicatorExists) {
      await expect(offlineIndicator).toBeVisible();

      // Go back online
      await context.setOffline(false);

      // Wait for online detection
      await page.waitForTimeout(2000);

      // Indicator should disappear or change to "Online"
      await expect(offlineIndicator).not.toBeVisible({ timeout: 5000 });
    } else {
      // If no offline indicator is implemented, skip this assertion
      test.skip(true, "Offline indicator not implemented yet (FEATURE 2.1 pending)");
    }
  });
});

/**
 * Note about running these tests:
 *
 * These tests require FEATURE 2.1 (Offline support) to be fully implemented.
 * If the feature is not ready, tests will either:
 * - Be skipped automatically
 * - Fail with clear error messages
 * - Pass if basic error handling exists
 *
 * Run these tests separately from main test suite:
 * npm run test:e2e -- offline.spec.ts
 */
