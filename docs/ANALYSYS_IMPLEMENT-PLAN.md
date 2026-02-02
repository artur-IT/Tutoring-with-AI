# Analiza planu integracji i propozycja wdrożenia

Ostatnia aktualizacja: 30 stycznia 2026 · Projekt: Korepetytor AI

## Cel projektu

Połączenie aplikacji edukacyjnej z AI Mistral w celu stworzenia interaktywnego korepetytora, który pomoże nastolatkom w nauce poprzez personalizowane rozmowy dostosowane do ich zainteresowań i poziomu wiedzy.

## Tech Stack

**Frontend (PWA-ready):**

- Astro 5
- React 19 + TypeScript 5
- Tailwind 4 + Shadcn/ui
- PWA Service Worker + Workbox

**Backend:**

- Node.js + Serverless (Vercel)
- Mistral AI API
- Localstorage

**Konfiguracja Mistral AI:**

- Model: `mistral-small` (tańszy, szybszy)
- Temperatura: 0.7 (równowaga kreatywność/precyzja)
- Max tokens: 500-1000 (krótkie, zwięzłe odpowiedzi)
- Język: Polski (dla nastolatków w Polsce)

## Dokumentacja techniczna

### Struktura agenta AI (mathTutor)

- **config.ts** – model, parametry (temperatura, max tokens)
- **prompts.ts** – prompt systemowy, szablony powitalne
- **types.ts** – Message, AIResponse, StudentData, ChatHistory
- **index.ts** – Mistral API, formatowanie historii, obsługa błędów

### API `/api/chat`

- Request: `message`, `history`, `studentData`, `subject`.

- Response: `response`, `success`, `error?`, `metadata`.

- Logika: walidacja → agent → kontekst (prompt + studentData + historia) → Mistral → zwrot.

### Wykorzystanie danych studenta (Personalizacja)

- `studentData.subject` → dostosowanie promptu
- `studentData.problem` → kontekst do odpowiedzi
- `studentData.interests` → personalizacja przykładów (np. procenty przez statystyki meczowe)

### PWA Cache Strategy (Service Worker)

**Status:** ✅ Pełna implementacja z @vite-pwa/astro + Workbox

- CacheFirst (obrazy), StaleWhileRevalidate (CSS/JS), NetworkFirst (HTML, API lokalne), NetworkOnly (Mistral API)
- Manifest: nazwa, ikony 192/512, display standalone
- Offline: historia z localStorage, OnlineProvider, OfflineIndicator, blokada UI gdy offline


## Status i plan wdrożenia

| EPIK | Status | FEATURE |
|------|--------|--------|
| EPIK 1 (Bezpieczeństwo) | ✅ 100% | 1.1 Rate limiting · 1.2 Timer sesji · 1.3 Debouncing · 1.4 Filtrowanie treści (`CONTENT_SECURITY.md`) |
| EPIK 2 (Offline + PWA) | ✅ 100% | 2.1 OnlineProvider, OfflineIndicator, PWA cache |
| EPIK 3 (Testowanie) | ⚠️ 83% | 3.1 Flow + scenariusze (`TESTS_PLAN.md`) · 3.2 Testy 48/48 · 3.3 Optymalizacja (tokeny ✅, prompt – do zrobienia) |

## Najważniejsze zasady

- **Małe kroki** – każda zmiana to osobny, mały krok
- **Testowanie** – testuj po każdym kroku
- **Jeden agent** – zacznij od matematyki, później powiel strukturę
- **Bezpieczeństwo** – zawsze waliduj dane wejściowe
- **Koszty** – monitoruj użycie API
- **UX** – obsłuż wszystkie stany (loading, error, empty)

## Następne kroki

- **Więcej agentów** – powiel strukturę mathTutor (chemTutor, physicsTutor itd.)
- **Historia w bazie** – zapisywanie sesji (np. baza danych; obecnie localStorage)
- **Push notifications** – przypomnienia o nauce (opcjonalnie)
