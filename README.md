# 🎓 Tutor with AI

Interactive AI tutor for teenagers (13-19 years old). The app explains difficult school topics in a simple and understandable way.

## ✨ Features

- 🤖 Chat with AI tutor (Mistral AI)
- 📐 Math support (more subjects planned)
- 💬 Conversation history (localStorage)
- 🎯 Personalization based on student interests
- ⏱️ Session limits (30 min, 50 messages, rate limiting)
- 📱 PWA - works offline, installable as app
- 🌐 Offline mode - read history without internet
- ♿ Accessibility optimized (ARIA, semantic HTML)
- 🚀 Lighthouse: Perf 78 / A11y 98 / SEO 100

## 🛠️ Tech Stack

- **Astro 5** + **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui**
- **Mistral AI**

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

## 📁 Structure

```
src/
├── agents/        # AI agents (tutors)
├── components/    # UI components
├── pages/         # App pages
└── pages/api/     # API endpoints
```

## 🧪 Testing

```bash
npm run test        # Unit tests (Vitest + React Testing Library)
```

**Test coverage:**

- ✅ 13 unit tests (Chat, NameInput, useDebounce)
- ✅ Manual testing for edge cases
