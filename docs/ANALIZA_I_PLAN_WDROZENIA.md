# Analiza planu integracji i propozycja wdrożenia 🎯

Data utworzenia: 8 grudnia 2025
Ostatnia aktualizacja: 30 stycznia 2026
Projekt: Tutor with AI

## Spis treści

- [Cel projektu](#cel-projektu)
- [Tech Stack](#tech-stack)
- [Dokumentacja techniczna](#dokumentacja-techniczna)
- [Status projektu](#status-projektu)
- [Plan wdrożenia](#plan-wdrożenia)
- [Najważniejsze zasady](#najważniejsze-zasady)
- [Przydatne linki](#przydatne-linki)
- [Następne kroki](#następne-kroki)

---

## Cel projektu

Połączenie aplikacji edukacyjnej z AI Mistral w celu stworzenia interaktywnego korepetytora, który pomoże nastolatkom w nauce poprzez personalizowane rozmowy dostosowane do ich zainteresowań i poziomu wiedzy.

---

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

---

## Dokumentacja techniczna

### Struktura agenta AI (mathTutor)

Każdy agent AI (korepetytor) ma osobny folder: `src/agents/[przedmiot]Tutor/`

- **config.ts** – osobowość agenta, ograniczenia, model AI, parametry (temperatura, max tokens)
- **prompts.ts** – prompt systemowy, styl odpowiedzi, szablony powitalne
- **types.ts** – Message, AIResponse, StudentData, ChatHistory
- **index.ts** – wysyłanie do Mistral, formatowanie historii, personalizacja, obsługa błędów

### API Endpoint (`/api/chat`)

**Request:** `message`, `history`, `studentData`, `subject`

**Response:** `response`, `success`, `error?`, `metadata`

**Logika:** Walidacja → wybór agenta → kontekst (prompt + studentData + historia) → Mistral API → zwrot wyniku.

### Wykorzystanie danych studenta (Personalizacja)

- `studentData.subject` → dostosowanie promptu
- `studentData.problem` → kontekst do odpowiedzi
- `studentData.interests` → personalizacja przykładów (np. procenty przez statystyki meczowe)

### PWA Cache Strategy (Service Worker)

**Status:** ✅ Pełna implementacja z @vite-pwa/astro + Workbox

- CacheFirst (obrazy), StaleWhileRevalidate (CSS/JS), NetworkFirst (HTML, API lokalne), NetworkOnly (Mistral API)
- Manifest: nazwa, ikony 192/512, display standalone
- Offline: historia z localStorage, OnlineProvider, OfflineIndicator, blokada UI gdy offline

Szczegóły w `astro.config.mjs`.

---

## Status projektu

**Postęp:** ~92% – MVP+ gotowe i zabezpieczone.

| EPIK | Status |
|------|--------|
| EPIK 1 (Bezpieczeństwo) | ✅ 100% – rate limiting, timer sesji, debouncing, filtrowanie treści, limity tokenów |
| EPIK 2 (Offline + PWA) | ✅ 100% – OnlineProvider, OfflineIndicator, cache, manifest |
| EPIK 3 (Testowanie) | ⚠️ 83% – testy jednostkowe 48/48 ✅, testy manualne 6/6 ✅, optymalizacja (FEATURE 3.3) do zrobienia |

**Zrealizowane:** Rate limiting (50/sesja), timer 30 min, limit 50 wiadomości, miesięczny limit tokenów (950M), debouncing, walidacja treści (contentFilter), PWA + Service Worker, obsługa offline, a11y (skip link, ARIA), SEO, znaki matematyczne i filtrowanie historii, 48 testów jednostkowych.

**Ostatnie wpisy (historia weryfikacji):**

- **30 stycznia 2026** – Zaktualizowano plan wdrożenia (gałąź refactor/everywhere).
- **22 stycznia 2026** – Naprawy: znaki matematyczne, ułamki, pętla powitania, filtrowanie historii; weryfikacja 48/48 testów.
- **20 stycznia 2026** – FEATURE 1.4 (Filtrowanie treści), dokumentacja TESTS_PLAN.md.
- **15 stycznia 2026** – Audyt kodu vs dokumentacja, poprawki SEO i a11y.

---

## Plan wdrożenia

### EPIK 1: Bezpieczeństwo i stabilność

**Status:** ✅ 100% ukończone

- ✅ FEATURE 1.1: Rate limiting (50 zapytań/sesja)
- ✅ FEATURE 1.2: Timer sesji (30 min, 50 wiadomości)
- ✅ FEATURE 1.3: Debouncing
- ✅ FEATURE 1.4: Filtrowanie treści (`docs/CONTENT_SECURITY.md`)

### EPIK 2: Obsługa offline i PWA

**Status:** ✅ 100% ukończone

- ✅ FEATURE 2.1: Pełna obsługa offline (OnlineProvider, OfflineIndicator, PWA cache)

### EPIK 3: Testowanie

**Status:** ⚠️ 83% ukończone

- ✅ FEATURE 3.1: Testowanie podstawowego flow – UKOŃCZONE (dokumentacja: `docs/TESTS_PLAN.md`, 6 scenariuszy)
- ✅ FEATURE 3.2: Testy edge cases (48 testów jednostkowych)
- ⏳ FEATURE 3.3: Optymalizacja kosztów i wydajności
  - ✅ Zrobione: monitorowanie tokenów (`tokenUsage.ts`), limity miesięczne, `/api/token-status`
  - Do zrobienia: analiza użycia tokenów, optymalizacja długości historii i promptu (niski priorytet)

---

## Najważniejsze zasady

- **Małe kroki** – każda zmiana to osobny, mały krok
- **Testowanie** – testuj po każdym kroku
- **Jeden agent** – zacznij od matematyki, później powiel strukturę
- **Bezpieczeństwo** – zawsze waliduj dane wejściowe
- **Koszty** – monitoruj użycie API
- **UX** – obsłuż wszystkie stany (loading, error, empty)

---

## Przydatne linki

- [Astro API Endpoints](https://docs.astro.build/en/core-concepts/endpoints/)

---

## Następne kroki

- **Więcej agentów** – powiel strukturę mathTutor (chemTutor, physicsTutor itd.)
- **Historia w bazie** – zapisywanie sesji (np. baza danych; obecnie localStorage)
- **Push notifications** – przypomnienia o nauce (opcjonalnie)
- **Optymalizacja** – analiza tokenów, skrócenie promptu (FEATURE 3.3)
