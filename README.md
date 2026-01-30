# 🎓 Tutor with AI

Interactive AI tutor for teenagers (13-19 years old). The app explains difficult school topics in a simple and understandable way.

## ✨ Features

- 🤖 Chat with AI tutor (Mistral AI)
- 📐 Math support (more subjects planned)
- 💬 Conversation history (localStorage)
- 🎯 Personalization based on student interests and problem description
- ⏱️ Session limits (30 min, 50 messages, rate limiting)
- 🔒 Content safety (input filtering, XSS protection, profanity filter)
- 📱 PWA - works offline, installable as app
- 🌐 Offline mode - read history without internet
- ♿ Accessibility optimized (ARIA, semantic HTML)

## 🛠️ Tech Stack

- **Astro 5** + **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui**
- **Mistral AI**
- **Vercel** (serverless deploy)

## 📋 Prerequisites

- Node.js v22.14.0+ (see `.nvmrc`)
- npm
- Mistral AI API key

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
MISTRAL_API_KEY=your_api_key_here
```

## 🚀 Getting Started

```bash
npm install
npm run dev
```

**Note:** `npm run preview` is not supported with the Vercel adapter. Use `npm run dev` for local development.

## 📜 Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start dev server (with `--host`) |
| `npm run build`   | Lint check + Astro build         |
| `npm run check`   | ESLint + Prettier + Astro check  |
| `npm run test`    | Unit tests (Vitest)              |
| `npm run test:ui` | Vitest UI                        |

## 📁 Structure

```
src/
├── agents/         # AI agents (e.g. mathTutor)
├── assets/         # Icons and static assets
├── components/     # React + Astro components
│   ├── chat/       # Chat UI (header, messages, input, stats)
│   ├── hooks/      # React hooks (session, online, debounce, etc.)
│   └── ui/         # shadcn/ui components
├── layouts/        # Astro layouts
├── lib/            # Utilities (contentFilter, chatHistory, tokenUsage, etc.)
├── pages/          # Astro pages
│   ├── api/        # API routes (chat, token-status)
│   ├── index.astro # Home
│   ├── tutors.astro
│   ├── chat.astro
│   ├── history-list.astro
│   └── history-chat.astro
└── styles/         # Global CSS
```

## 🧪 Testing

```bash
npm run test        # Unit tests (Vitest + React Testing Library)
```

**Test coverage:**

- ✅ 48 unit tests
  - Chat (7), NameInput (3), useDebounce (3)
  - contentFilter (35) – content safety
- ✅ Manual testing for edge cases (see `docs/TESTS_PLAN.md`)

## 📚 Documentation

- `docs/ANALIZA_I_PLAN_WDROZENIA.md` – project plan and status
- `docs/CONTENT_SECURITY.md` – content filtering and security
- `docs/TESTS_PLAN.md` – manual test scenarios
