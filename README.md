# 🎓 Tutor with AI

Interactive AI tutor for teenagers (13-19 years old). The app explains difficult school topics in a simple and understandable way.

## ✨ Features

- 🤖 Chat with AI tutor (Mistral)
- 📐 Math support
- 💬 Conversation history
- 🎯 Personalization based on student interests
- ⏱️ Session limits for safety

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
npm run test        # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
```
