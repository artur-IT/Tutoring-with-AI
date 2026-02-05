# Content security – documentation

The **Tutor with AI** app protects user-supplied content against:

- XSS (Cross-Site Scripting)
- Profanity and inappropriate content
- Prompt injection
- Leakage of personal data

Validation is centralized in `validateAndSanitizeInput()` from `@/lib/contentFilter`, used in `Chat.tsx`, `chat.ts` API, and `mathTutor/index.ts` (defense in depth).



## Implemented safeguards

### 1. HTML sanitization (XSS)

- **Method:** HTML escaping. Same behavior in browser and Node.js (no DOM dependency).

- Always applied inside `validateAndSanitizeInput()` regardless of options.

### 2. Profanity filter

- **Detected:** Common Polish profanity, variants with character substitutions (e.g. k*rwa), fuzzy matching for numbers/symbols (a→@4, e→3, i→1!, o→0).

- **Used in:** Chat messages and `TutorsForm.tsx`. Backend re-checks in `chat.ts`. Blocklist may need extension over time.

### 3. Prompt injection detection

- Applied to chat messages only.

### 4. Personal data detection

- **Detected:** Phone numbers (PL format), emails, URLs, postal codes (XX-XXX).

- **Note:** Not applied to form fields (interests, problem description).



## Length limits

| Field              | Limit | Location              |
|--------------------|-------|-----------------------|
| Chat message       | 400   | `Chat.tsx`, `chat.ts` |
| Problem description| 200   | `TutorsForm.tsx`      |
| Interests          | 100   | `TutorsForm.tsx`      |
| User name          | 20    | `NameInput.tsx`       |



## Validation flow

 **Frontend (chat):** User sends message → `Chat.tsx::handleSendInternal()` → `validateAndSanitizeInput()` (length, HTML, profanity, prompt injection, personal data) → on error show message, on success call API.

 **Backend:** `chat.ts` receives request → basic check (empty, type) → same `validateAndSanitizeInput()` → invalid → 400; valid → `mathTutor` → response.

 **Agent:** Uses `validateAndSanitizeInput()` with `contentRestrictions`; sends `validation.sanitized ?? message` to Mistral.

 **Display:** Messages rendered by React (`{message.content}`), which escapes by default (XSS protection). Assistant messages use `cleanMathNotation()` for math/LaTeX. No separate `sanitizeForDisplay()`.


## Security headers (production)

Set in `vercel.json` on Vercel:

- **Content-Security-Policy** – script, style, font, connection sources
- **X-Frame-Options: DENY** – no iframe embedding (clickjacking)
- **X-Content-Type-Options: nosniff** – no MIME sniffing
- **Referrer-Policy: strict-origin-when-cross-origin**
