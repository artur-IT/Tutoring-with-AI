import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Chat Edge Cases
 *
 * These tests verify that the application handles edge cases properly:
 * - TEST 7: Questions outside the subject area (off-topic)
 * - TEST 9: Message limit enforcement (50 messages per session)
 */

// Run tests serially to avoid overwhelming the API
test.describe.configure({ mode: "serial" });

test.describe("Chat Edge Cases", () => {
  // Setup: Create a test user before each test
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
   * TEST 7: Off-topic question (question outside math subject)
   *
   * Priority: HIGH
   *
   * Scenario:
   * 1. User asks a question not related to mathematics
   * 2. AI should politely decline and suggest asking math questions
   * 3. Response should be friendly and educational
   */
  test("TEST 7: Should handle off-topic questions appropriately", async ({ page }) => {
    // Count initial assistant messages (should be 1 - welcome message)
    const initialBubbles = await page.locator(".bg-yellow-200").count();

    // Type an off-topic question (biology)
    const offTopicQuestion = "Co to jest fotosynteza?";
    await page.getByPlaceholder(/wpisz pytanie z matematyki/i).fill(offTopicQuestion);

    // Send the message (button text is "Send message")
    await page.getByRole("button", { name: /send message/i }).click();

    // Wait for AI response (new yellow bubble)
    await waitForNewAssistantMessage(page, initialBubbles);

    // Get the last assistant message (yellow bubble with Korepetytor)
    const assistantBubbles = await page.locator(".bg-yellow-200").all();
    const lastResponse = assistantBubbles[assistantBubbles.length - 1];
    const responseText = await lastResponse.textContent();

    // Verify response indicates this is off-topic
    // AI should mention that the question is not about mathematics
    const isOffTopicResponse =
      responseText?.toLowerCase().includes("matematyk") ||
      responseText?.toLowerCase().includes("mat") ||
      responseText?.toLowerCase().includes("przedmiot") ||
      (responseText?.toLowerCase().includes("pomocy") && responseText?.toLowerCase().includes("matematyczny"));

    expect(isOffTopicResponse).toBeTruthy();

    // Verify response is polite (should not contain harsh rejection)
    expect(responseText?.toLowerCase()).not.toContain("nie mogę");
    expect(responseText?.toLowerCase()).not.toContain("odmawiam");
  });

  /**
   * TEST 7b: Should respond to valid math question after off-topic
   *
   * Scenario:
   * 1. User asks off-topic question
   * 2. Then asks a valid math question
   * 3. AI should respond normally to math question
   */
  test("TEST 7b: Should respond normally to math questions after off-topic", async ({ page }) => {
    // Count initial assistant messages
    let currentBubbles = await page.locator(".bg-yellow-200").count();

    // First, ask off-topic question
    await page.getByPlaceholder(/wpisz pytanie z matematyki/i).fill("Co to jest fotosynteza?");
    await page.getByRole("button", { name: /send message/i }).click();
    await waitForNewAssistantMessage(page, currentBubbles);

    // Wait a bit for response to complete
    await page.waitForTimeout(1000);

    // Update count
    currentBubbles = await page.locator(".bg-yellow-200").count();

    // Now ask a valid math question
    const mathQuestion = "Jak obliczyć pole koła?";
    await page.getByPlaceholder(/wpisz pytanie z matematyki/i).fill(mathQuestion);
    await page.getByRole("button", { name: /send message/i }).click();

    // Wait for AI response
    await waitForNewAssistantMessage(page, currentBubbles);

    // Get the last assistant message
    const assistantBubbles = await page.locator(".bg-yellow-200").all();
    const lastResponse = assistantBubbles[assistantBubbles.length - 1];
    const responseText = await lastResponse.textContent();

    // Verify response is about calculating circle area
    const isMathResponse =
      responseText?.toLowerCase().includes("koła") ||
      responseText?.toLowerCase().includes("promień") ||
      responseText?.toLowerCase().includes("π") ||
      responseText?.toLowerCase().includes("pi");

    expect(isMathResponse).toBeTruthy();
  });

  /**
   * TEST 9: Message limit enforcement (50 messages per session)
   *
   * Priority: HIGH
   *
   * Scenario:
   * 1. User sends 50 messages (maximum allowed)
   * 2. After 50th message, session should end
   * 3. User should see a limit reached message
   * 4. User should be redirected or prevented from sending more
   *
   * Note: This test is time-consuming (50 API requests)
   * Consider running it separately or with shorter timeout in CI
   */
  test.skip("TEST 9: Should enforce 50 message limit per session", async ({ page }) => {
    // This test is very time-consuming (50 API calls) - run manually when needed
    // Command: npx playwright test --grep "TEST 9:" --project=chromium --timeout=600000

    // Send 50 messages (this will take time due to API calls)
    for (let i = 1; i <= 50; i++) {
      // Fill input with a simple math question
      const question = `Ile jest ${i} + ${i}?`;
      await page.getByPlaceholder(/wpisz pytanie z matematyki/i).fill(question);

      // Click send button
      await page.getByRole("button", { name: /send message/i }).click();

      // Wait for response (but not too long - we want to move quickly)
      try {
        const currentBubbles = await page.locator(".bg-yellow-200").count();
        await waitForNewAssistantMessage(page, currentBubbles);
      } catch (error) {
        console.log(`Timeout waiting for response to message ${i}`, error);
      }

      // Small delay between messages to avoid overwhelming the API
      await page.waitForTimeout(500);

      // Log progress every 10 messages
      if (i % 10 === 0) {
        console.log(`Sent ${i}/50 messages`);
      }
    }

    // After 50 messages, check if limit dialog appears
    const limitAlert = page.getByRole("alertdialog").or(page.getByText(/limit/i));
    await expect(limitAlert).toBeVisible({ timeout: 5000 });

    // Verify user cannot send more messages (input should be disabled or session ended)
    const sendButton = page.getByRole("button", { name: /send message/i });

    // Either button is disabled or dialog blocks interaction
    const isButtonDisabled = await sendButton.isDisabled().catch(() => true);
    const isDialogVisible = await limitAlert.isVisible().catch(() => false);

    expect(isButtonDisabled || isDialogVisible).toBeTruthy();
  });

  /**
   * TEST 9b: Message limit warning at 80% (40 messages)
   *
   * Scenario:
   * 1. User sends 40 messages (80% of limit)
   * 2. A warning should appear
   * 3. Progress bar should show 80%
   */
  test.skip("TEST 9b: Should show warning at 80% limit (40 messages)", async ({ page }) => {
    // This test is very time-consuming (40 API calls) - run manually when needed
    // Command: npx playwright test --grep "TEST 9b:" --project=chromium --timeout=600000

    // Send 40 messages (80% of limit)
    for (let i = 1; i <= 40; i++) {
      const question = `Ile jest ${i} * 2?`;
      await page.getByPlaceholder(/wpisz pytanie z matematyki/i).fill(question);
      await page.getByRole("button", { name: /send message/i }).click();

      try {
        const currentBubbles = await page.locator(".bg-yellow-200").count();
        await waitForNewAssistantMessage(page, currentBubbles);
      } catch (error) {
        console.log(`Timeout waiting for response to message ${i}`, error);
      }

      await page.waitForTimeout(500);

      if (i % 10 === 0) {
        console.log(`Sent ${i}/40 messages`);
      }
    }

    // Check if warning appears
    const warningAlert = page.getByText(/ostrzeżenie|limit|zostało|pozostało/i);

    // Warning should be visible at 80% threshold
    await expect(warningAlert).toBeVisible({ timeout: 5000 });

    // Progress bar should exist and show significant progress
    const progressBar = page.locator('[role="progressbar"]').first();
    await expect(progressBar).toBeVisible();
  });
});
