# E2E Tests - Chat with Hero

This folder contains End-to-End tests for edge cases in the Chat with Hero application.

## 📋 Test Coverage

### Edge Cases Tests (`chat-edge-cases.spec.ts`)

Tests are configured to run **serially** (one at a time) to avoid overwhelming the Mistral AI API.

1. **TEST 7**: Off-topic questions ✅
   - Verifies AI politely declines questions outside mathematics
   - Tests if AI redirects to math-related questions
   - Checks response is educational and friendly

2. **TEST 7b**: Math questions after off-topic ✅
   - Verifies AI responds normally to math questions after off-topic attempt
   - Tests continuity of conversation

3. **TEST 9**: 50 message limit enforcement
   - Verifies session ends after 50 messages
   - Checks if limit dialog appears
   - **Note:** Time-consuming test (skipped in CI)

4. **TEST 9b**: Warning at 80% limit (40 messages)
   - Verifies warning appears at 40 messages (80% of limit)
   - Checks progress bar visibility
   - **Note:** Time-consuming test (skipped in CI)

### Offline Mode Tests (`offline.spec.ts`)

5. **TEST 8a**: Offline state handling
   - Verifies app shows offline message or disables send button
   - Tests reconnection when back online

6. **TEST 8b**: Chat history preservation offline
   - Verifies messages remain visible when offline
   - Checks history integrity

7. **TEST 8c**: Offline indicator
   - Verifies UI shows offline indicator
   - **Note:** Depends on FEATURE 2.1 (Offline support)

## 🚀 Running Tests

### Prerequisites

1. Install Playwright browsers (first time only):

```bash
npx playwright install
```

2. Make sure the dev server is NOT running (Playwright will start it automatically)

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Browser

```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit (Safari) only
npx playwright test --project=webkit
```

### Run Specific Test File

```bash
# Edge cases tests only
npx playwright test tests/chat-edge-cases.spec.ts

# Offline tests only
npx playwright test tests/offline.spec.ts
```

### Run Specific Test

```bash
# TEST 7 only
npx playwright test tests/chat-edge-cases.spec.ts:50
```

### Debug Mode

```bash
# Run with UI
npm run test:e2e:ui

# Debug mode with Playwright Inspector
npx playwright test --debug
```

### Run Tests with Headed Browser

```bash
npx playwright test --headed
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Test results are saved in:

- `playwright-report/` - HTML report
- `test-results/` - Screenshots and videos on failure

## ⚠️ Known Issues

### Server Connection Issues

If tests fail with `ERR_CONNECTION_REFUSED`:

1. **Stop any running dev server** in other terminals
2. Make sure port 3000 is available
3. Run tests again - Playwright will start the server automatically

### Long-Running Tests

Tests 9 and 9b are time-consuming (50 and 40 API requests respectively):

- They are automatically skipped in CI (`process.env.CI`)
- To run them locally: `npx playwright test --grep "TEST 9"`

### Offline Tests

TEST 8 tests depend on FEATURE 2.1 (Offline support):

- If offline mode is not implemented, these tests will skip or fail gracefully
- Run them separately: `npx playwright test tests/offline.spec.ts`

## 🔧 Configuration

Playwright configuration is in `playwright.config.ts`:

- Base URL: `http://127.0.0.1:3000` (as configured in `astro.config.mjs`)
- Browsers: Chromium, Firefox, WebKit
- Test mode: **Serial** (one test at a time to avoid API overload)
- Timeout: 120 seconds for server start
- Screenshots: On failure only
- Trace: On first retry

## 📚 Related Documentation

- Test plan: `docs/TESTS_PLAN.md`
- Unit tests: `src/components/*.test.tsx`
- Project docs: `ANALIZA_I_PLAN_WDROZENIA.md`

## 💡 Tips

1. **Faster testing**: Run only Chromium for quick feedback
2. **Debugging**: Use `--headed --debug` to see browser actions
3. **CI/CD**: Use `CI=true` environment variable to skip long tests
4. **Serial execution**: Tests run serially by default to avoid API overload

## 🐛 Troubleshooting

### Test timeout

- Increase timeout in `playwright.config.ts` if needed
- Check if API (Mistral) is responding slowly

### Flaky tests

- Add `await page.waitForTimeout(ms)` if elements load slowly
- Use `waitForSelector` with explicit timeouts

### Browser not found

- Run `npx playwright install` to install browsers
- Check if all browsers installed: `npx playwright install --dry-run`

---

**Last updated:** January 8, 2026
**Test Framework:** Playwright v1.57.0
