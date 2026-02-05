# Key implementation details

## Project goal

Combine an educational app with Mistral AI to build an interactive tutor that helps teenagers learn through personalized conversations tailored to their interests and knowledge level.

## Tech stack

**Frontend (PWA-ready):**

- Astro 5
- React 19 + TypeScript 5
- Tailwind 4 + Shadcn/ui
- PWA Service Worker + Workbox

**Backend:**

- Node.js + Serverless (Vercel)
- Mistral AI API
- Localstorage

**Mistral AI configuration:**

- Model: `mistral-small` (cheaper, faster)
- Temperature: 0.7 (balance of creativity and precision)
- Max tokens: 500–1000 (short, concise answers)
- Language: Polish (for teenagers in Poland)

## Technical documentation

### AI agent structure (mathTutor)

- **config.ts** – model, parameters (temperature, max tokens)
- **prompts.ts** – system prompt, welcome templates
- **types.ts** – Message, AIResponse, StudentData, ChatHistory
- **index.ts** – Mistral API, history formatting, error handling

### API `/api/chat`

- Request: `message`, `history`, `studentData`, `subject`.
- Response: `response`, `success`, `error?`, `metadata`.
- Flow: validation → agent → context (prompt + studentData + history) → Mistral → return.

### Use of student data (personalization)

- `studentData.subject` → prompt tuning
- `studentData.problem` → context for answers
- `studentData.interests` → personalized examples (e.g. percentages via match statistics)

### PWA cache strategy (Service Worker)

**Status:** ✅ Full implementation with @vite-pwa/astro + Workbox

- CacheFirst (images), StaleWhileRevalidate (CSS/JS), NetworkFirst (HTML, local API), NetworkOnly (Mistral API)
- Manifest: name, icons 192/512, display standalone
- Offline: history from localStorage, OnlineProvider, OfflineIndicator, UI blocked when offline

## Key principles

- **Testing** – test after each step
- **Security** – always validate input
- **Costs** – monitor API usage
- **UX** – handle all states (loading, error, empty)

## Next steps

- **More agents** – reuse mathTutor structure (chemTutor, physicsTutor, etc.)
- **History in database** – persist sessions (e.g. database; currently localStorage)
- **Push notifications** – study reminders (optional)
