# Analiza planu integracji i propozycja wdrożenia 🎯

Data utworzenia: 8 grudnia 2025
Ostatnia aktualizacja: 23 stycznia 2026
Projekt: Chat-with-Hero (Tutor with AI)

> **📝 Uwaga:** Ten dokument zastąpił i rozszerzył `PLAN_Integrity_with_Mistral_AI.md`.
> Stary plan został przeniesiony do `docs/archive/` jako dokumentacja historyczna.

## Spis treści

- [Cel projektu](#cel-projektu)
- [Tech Stack](#tech-stack)
- [Dokumentacja techniczna](#dokumentacja-techniczna)
  - [Struktura agenta AI (mathTutor)](#struktura-agenta-ai-mathtutor)
  - [API Endpoint (/api/chat)](#api-endpoint-apichat)
  - [Wykorzystanie danych studenta (Personalizacja)](#wykorzystanie-danych-studenta-personalizacja)
  - [PWA Cache Strategy (Service Worker)](#pwa-cache-strategy-service-worker)
- [Aktualny status projektu](#aktualny-status-projektu)
  - [Ukończone funkcjonalności](#ukończone-funkcjonalności)
  - [Historia weryfikacji i aktualizacji](#historia-weryfikacji-i-aktualizacji)
  - [Częściowo zaimplementowane](#częściowo-zaimplementowane)
  - [W trakcie realizacji](#w-trakcie-realizacji)
  - [Do zrobienia (pozostałe zadania)](#do-zrobienia-pozostałe-zadania)
- [Plan wdrożenia](#plan-wdrożenia)
  - [EPIK 1: Bezpieczeństwo i stabilność](#epik-1-bezpieczeństwo-i-stabilność)
  - [EPIK 2: Obsługa offline i PWA](#epik-2-obsługa-offline-i-pwa)
  - [EPIK 3: Testowanie ](#epik-3-testowanie)
- [Status projektu](#status-projektu)
- [Następne kroki](#następne-kroki)
- [Osiągnięcia](#osiągnięcia)

---

## Cel projektu

Połączenie aplikacji edukacyjnej z AI Mistral w celu stworzenia interaktywnego korepetytora, który pomoże nastolatkom w nauce poprzez personalizowane rozmowy dostosowane do ich zainteresowań i poziomu wiedzy.

---

## Tech Stack

**Frontend (PWA-ready):**

- Astro 5
- React 19 + TypeScript 5
- Tailwind 4 + Shadcn/ui
- React Query (planowane)
- Redux Toolkit (planowane)
- PWA Service Worker + Workbox

**Backend:**

- Node.js + Serverless (Vercel)
- Supabase (planowane - Postgres + Auth + Storage)
- Mistral AI API

**Konfiguracja Mistral AI:**

- Model: `mistral-small` (tańszy, szybszy)
- Temperatura: 0.7 (równowaga kreatywność/precyzja)
- Max tokens: 500-1000 (krótkie, zwięzłe odpowiedzi)
- Język: Polski (dla nastolatków w Polsce)

---

## Dokumentacja techniczna

### Struktura agenta AI (mathTutor)

Każdy agent AI (korepetytor) ma osobny folder: `src/agents/[przedmiot]Tutor/`

#### `config.ts`

- Osobowość agenta (przyjazny, cierpliwy nauczyciel)
- Ograniczenia (tylko matematyka, bezpieczne treści)
- Model AI (`mistral-small`, `mistral-medium`)
- Parametry (temperatura, max tokens)

#### `prompts.ts`

- Prompt systemowy (instrukcje dla AI)
- Styl odpowiedzi (krótki, zrozumiały, z przykładami)
- Szablony wiadomości powitalnych
- Kontekst edukacyjny

#### `types.ts`

- Interfejs wiadomości (Message)
- Interfejs odpowiedzi AI (AIResponse)
- Typ danych studenta (StudentData)
- Typ historii konwersacji (ChatHistory)

#### `index.ts`

- Funkcja wysyłania wiadomości do Mistral
- Funkcja formatowania historii
- Funkcja personalizacji na podstawie danych studenta
- Obsługa błędów

### API Endpoint (`/api/chat`)

**Request (co przyjmuje):**

- `message: string` - Wiadomość użytkownika
- `history: Message[]` - Historia czatu
- `studentData: StudentData` - Dane studenta (zainteresowania, poziom)
- `subject: string` - ID agenta/przedmiotu

**Response (co zwraca):**

- `response: string` - Odpowiedź AI
- `success: boolean` - Status
- `error?: string` - Komunikat błędu (jeśli wystąpił)
- `metadata` - Tokeny, czas odpowiedzi

**Logika przetwarzania:**

1. Walidacja danych wejściowych
2. Pobranie odpowiedniego agenta (np. mathTutor)
3. Przygotowanie kontekstu (prompt + dane studenta + historia)
4. Wywołanie Mistral API
5. Przetworzenie odpowiedzi
6. Zwrócenie wyniku

### Wykorzystanie danych studenta (Personalizacja)

Dane z localStorage:

- `studentData.subject` - wybrany przedmiot → dostosowanie promptu systemowego
- `studentData.problem` - konkretne problemy → kontekst do odpowiedzi
- `studentData.interests` - zainteresowania → personalizacja przykładów

**Przykład:**
Jeśli uczeń interesuje się piłką nożną, AI może wyjaśnić procenty używając statystyk meczowych.

### PWA Cache Strategy (Service Worker)

**Status:** ✅ Pełna implementacja z @vite-pwa/astro + Workbox

**Cache Strategies (astro.config.mjs):**

1. **CacheFirst** - dla obrazów
   - Pattern: `.png|jpg|jpeg|svg|gif|webp|avif|ico`
   - Cache name: `images-cache`
   - Expiration: 30 dni, max 60 plików

2. **StaleWhileRevalidate** - dla CSS i JS
   - Pattern: `.js|css`
   - Cache name: `static-resources`
   - Expiration: 7 dni, max 60 plików

3. **NetworkFirst** - dla HTML stron
   - Pattern: navigation requests i `.html`
   - Cache name: `pages-cache`
   - Timeout: 5s, fallback do cache
   - Expiration: 1 dzień, max 50 stron

4. **NetworkFirst** - dla lokalnego API
   - Pattern: `/api/*`
   - Cache name: `api-cache`
   - Timeout: 10s, fallback do cache
   - Expiration: 5 minut, max 50 requestów

5. **NetworkOnly** - dla Mistral AI
   - Pattern: `https://api.mistral.ai/*`
   - Cache name: `mistral-api`
   - Nigdy nie cache (API zewnętrzne, dynamiczne dane)

**Manifest (manifest.webmanifest):**

- Name: "Tutor with AI"
- Short name: "Tutor AI"
- Display: standalone
- Icons: 192x192, 512x512 (maskable)
- Theme: #ffffff

**Offline Support:**

- Historia dostępna offline (localStorage)
- OnlineProvider wykrywa brak połączenia
- OfflineIndicator informuje użytkownika
- UI zablokowane gdy offline (textarea + button disabled)

---

## Aktualny status projektu

**Postęp ogólny:** ~95% ukończone (MVP+ gotowe, zabezpieczone i przetestowane!)

**Ostatnia weryfikacja:** 23 stycznia 2026
**Ostatnia aktualizacja:** 23 stycznia 2026

### Ukończone funkcjonalności

**Bezpieczeństwo i kontrola:**

- ✅ Rate limiting (50 zapytań na sesję) - pełna implementacja
- ✅ Timer sesji (30 minut) - automatyczne zakończenie
- ✅ Limit wiadomości (50 pytań) - automatyczne sprawdzanie
- ✅ **Miesięczny limit tokenów (950M/miesiąc)** - pełna implementacja z logowaniem i sprawdzaniem
- ✅ Blokowanie przycisku podczas wysyłania
- ✅ Debouncing (opóźnienie 500ms) - zapobieganie wielokrotnemu wysyłaniu
- ✅ Walidacja długości wiadomości (400 znaków) z wizualnym feedbackiem

**PWA (Progressive Web App):**

- ✅ Pełna konfiguracja (@vite-pwa/astro + Workbox)
- ✅ Service Worker z inteligentnym cache
- ✅ Web App Manifest (instalacja jako aplikacja)
- ✅ Ikony PWA (192x192, 512x512, Apple Touch Icon)
- ✅ Cache strategies:
  - CacheFirst dla obrazów (30 dni)
  - StaleWhileRevalidate dla CSS/JS (7 dni)
  - NetworkFirst dla HTML i API lokalnego (fallback do cache)
  - NetworkOnly dla Mistral AI (nigdy nie cache)

**Obsługa offline:**

- ✅ OnlineProvider (wykrywanie stanu połączenia + test faktycznego dostępu)
- ✅ useOnline hook (React hook dla statusu)
- ✅ OfflineIndicator - komunikat o braku połączenia
- ✅ Blokowanie wysyłania wiadomości offline (disabled input + button)
- ✅ Placeholder "Brak połączenia z internetem" w textarea
- ✅ Historia dostępna offline (localStorage)
- ✅ Auto re-check statusu przy View Transitions

**UI/UX:**

- ✅ Wyświetlanie wybranego tematu w historii rozmowy
- ✅ SEO podstawowe (meta description, canonical, OG, Twitter, lang=pl)
- ✅ Accessibility (skip link, etykiety ARIA, aria-live, semantyka HTML)
- ✅ Odciążenie startu (client:idle, requestIdleCallback, width/height ikon)
- ✅ **Poprawne wyświetlanie znaków matematycznych** - ułamki (1/2), operatory (+, -, *, /), symbole (^, _, $) wyświetlają się poprawnie
- ✅ **Filtrowanie historii** - sesje z tylko 1 wiadomością (tylko powitanie) nie są zapisywane w historii

**Testowanie:**

- ✅ Testy jednostkowe (48/48 ✅) - Vitest + React Testing Library:
  - Chat.test.tsx (7 testów) - wszystkie przechodzą
  - NameInput.test.tsx (3 testy) - wszystkie przechodzą
  - useDebounce.test.ts (3 testy) - wszystkie przechodzą
  - contentFilter.test.ts (35 testów) - zabezpieczenia treści

### Historia weryfikacji i aktualizacji

- **22 stycznia 2026** - **[NAPRAWA]** Naprawiono wyświetlanie znaków specjalnych matematycznych - usunięto niepotrzebne escape'owanie w `sanitizeForDisplay`, znaki jak `/`, `\`, `*`, `+`, `-`, `=`, `^`, `_`, `$` wyświetlają się poprawnie
- **22 stycznia 2026** - **[NAPRAWA]** Naprawiono wyświetlanie ułamków - usunięto regex w `cleanMathNotation`, który usuwał kreskę ułamkową, ułamki jak `1/2`, `3/4` wyświetlają się poprawnie
- **22 stycznia 2026** - **[NAPRAWA]** Naprawiono problem z pętlą pierwszego powitania - dodano `initialGreetingSentRef` do zapobiegania wielokrotnym wywołaniom `sendInitialGreeting`
- **22 stycznia 2026** - **[NAPRAWA]** Dodano filtrowanie historii - sesje z tylko 1 wiadomością (tylko powitanie od AI) nie są zapisywane w historii rozmów
- **22 stycznia 2026** - **[WERYFIKACJA]** Sprawdzono wszystkie testy - 48/48 przechodzi ✅, naprawiono 2 testy w Chat.test.tsx (placeholder text)
- **22 stycznia 2026** - **[WERYFIKACJA]** Potwierdzono implementację miesięcznych limitów tokenów (950M/miesiąc) - pełna integracja w mathTutor/index.ts
- **22 stycznia 2026** - **[UKOŃCZENIE]** Wykonano testy manualne FEATURE 3.1 - wszystkie 6 scenariuszy przeszły pomyślnie ✅
- **20 stycznia 2026** - Ukończono FEATURE 1.4 (Filtrowanie treści) - sanityzacja HTML, filtr wulgaryzmów, prompt injection, dane osobowe (35 testów ✅)
- **20 stycznia 2026** - Utworzono dokumentację testów FEATURE 3.1 w `docs/TESTS_PLAN.md` - 6 scenariuszy podstawowego flow
- **15 stycznia 2026** - **[AUDYT]** Pełna weryfikacja kodu vs dokumentacja - zaktualizowano status
- **15 stycznia 2026** - Poprawki SEO + lekka optymalizacja wydajności, Lighthouse: Perf 78 / SEO 100
- **15 stycznia 2026** - Poprawki a11y (skip link + main, etykiety pól, aria-live, semantyka list/regionów, usunięcie zagnieżdżonych elementów interaktywnych)
- **8 stycznia 2026** - Ukończono FEATURE 3.2 (Testowanie edge cases) - testy jednostkowe (13/13 ✅)
- **7 stycznia 2026** - Dokończono FEATURE 1.3 (Debouncing) - dodano hook `useDebounce`
- **7 stycznia 2026** - Pełna weryfikacja kodu - status potwierdzony jako aktualny
- **9 grudnia 2025** - Utworzenie dokumentu i implementacja FEATURE 1.1, 1.2
---

## Plan wdrożenia

### EPIK 1: Bezpieczeństwo i stabilność

**Status:** ✅ 100% ukończone

- ✅ FEATURE 1.1: Rate limiting (50 zapytań/sesja)
- ✅ FEATURE 1.2: Timer sesji (30 min, 50 wiadomości)
- ✅ FEATURE 1.3: Debouncing (ochrona przed wielokrotnym wysłaniem)
- ✅ FEATURE 1.4: Filtrowanie treści - **UKOŃCZONE** (20 stycznia 2026)

---

#### ✅ FEATURE 1.4: Filtrowanie treści i bezpieczeństwo - **UKOŃCZONE**

**Status:** ✅ Zakończone (20 stycznia 2026)

**User Stories:**

1. ✅ Jako rodzic chcę mieć pewność że aplikacja filtruje nieodpowiednie treści żeby chronić moje dziecko
2. ✅ Jako uczeń chcę otrzymywać tylko bezpieczne odpowiedzi żeby czuć się komfortowo

**Zaimplementowane zabezpieczenia:**

- ✅ **Sanityzacja HTML (XSS Protection)** - HTML Character Escaping
- ✅ **Filtr wulgaryzmów** - Blacklista 25+ słów + fuzzy matching
- ✅ **Detekcja prompt injection** - 10 wzorców wykrywających manipulację
- ✅ **Detekcja danych osobowych** - telefon, email, URL, kod pocztowy
- ✅ **Limity długości** - wizualne liczniki w UI
- ✅ **Wielowarstwowa walidacja** - frontend + backend
- ✅ **Testy jednostkowe** - 33 testy (100% pass)

**Pliki:**
- `src/lib/contentFilter.ts` - główny moduł filtrowania
- `src/lib/contentFilter.test.ts` - testy jednostkowe
- `docs/CONTENT_SECURITY.md` - pełna dokumentacja techniczna
- `docs/IMPLEMENTATION_SUMMARY.md` - podsumowanie implementacji

**Kryteria akceptacji:**

- ✅ Nieodpowiednie treści są wykrywane i blokowane
- ✅ Użytkownik otrzymuje przyjazny komunikat
- ✅ Filtrowanie działa na frontendzie i backendzie (defense in depth)

---

### EPIK 2: Obsługa offline i PWA

**Status:** ✅ 100% ukończone

- ✅ FEATURE 2.1: Pełna obsługa offline (OnlineProvider, OfflineIndicator, PWA cache)

---

### EPIK 3: Testowanie

**Status:** ⚠️ 83% ukończone

- ✅ FEATURE 3.1: Testowanie podstawowego flow - **UKOŃCZONE** (22 stycznia 2026) - wszystkie 6 scenariuszy przeszły pomyślnie ✅
- ✅ FEATURE 3.2: Testowanie edge cases (46 testów jednostkowych: 13 edge cases + 33 content security)

---

#### ✅ FEATURE 3.1: Testowanie podstawowego flow - **UKOŃCZONE**

**Status:** ✅ Zakończone (22 stycznia 2026)

**User Stories:**

1. ✅ Jako developer chcę mieć pewność że podstawowe scenariusze działają poprawnie żeby móc wdrożyć aplikację
2. ✅ Jako użytkownik chcę mieć pewność że aplikacja działa stabilnie żeby móc na niej polegać

**Dokumentacja:**
- `docs/TESTS_PLAN.md` - pełna dokumentacja z 6 scenariuszami testowymi (FEATURE 3.1) oraz testami edge cases (FEATURE 3.2)

**Wykonane:**
- ✅ Wykonano testy manualne zgodnie ze scenariuszami w `TESTS_PLAN.md` (22 stycznia 2026)
- ✅ Zapisano wyniki w tabeli w `TESTS_PLAN.md` - wszystkie 6 scenariuszy przeszły pomyślnie ✅
- ✅ Brak zidentyfikowanych problemów

**Kryteria akceptacji:**

- ✅ Wszystkie scenariusze testowe są udokumentowane w `TESTS_PLAN.md`
- ✅ Wszystkie scenariusze testowe przechodzą pomyślnie (6/6 ✅)
- ✅ Wyniki testów są zapisane w dokumentacji

---

#### FEATURE 3.3: Optymalizacja kosztów i wydajności

**Status:** Częściowo zaimplementowane - monitoring działa, optymalizacja do zrobienia

**Zaimplementowane:**
- ✅ **Monitorowanie użycia tokenów** - pełna implementacja w `src/lib/tokenUsage.ts`
  - Logowanie każdego użycia (input/output/total tokens)
  - Miesięczne limity (950M tokenów/miesiąc)
  - API endpoint `/api/token-status` do sprawdzania statusu
  - Sprawdzanie limitu przed każdym wywołaniem API (`isMonthlyLimitReached`)
  - Automatyczne blokowanie gdy limit osiągnięty

**User Stories:**

1. Jako administrator chcę monitorować użycie API żeby kontrolować koszty - ✅ **ZROBIONE**
2. Jako użytkownik chcę mieć szybkie odpowiedzi żeby nie tracić czasu - ⏳ **DO ZROBIENIA**

**Tasks:**

- [x] Task: Monitorowanie użycia API - ✅ **UKOŃCZONE**
  - **Opis:** Logowanie użycia tokenów i kosztów w konsoli
  - **Pliki:** `src/lib/tokenUsage.ts`, `src/agents/mathTutor/index.ts`, `src/pages/api/token-status.ts`
  - **Status:** Pełna implementacja z miesięcznymi limitami

- [ ] Task: Analiza użycia tokenów
  - **Opis:** Sprawdzenie ile tokenów jest używanych w typowej sesji
  - **Pliki:** Dokumentacja optymalizacji (nowy plik `OPTIMIZATION.md`)
  - **Priorytet:** NISKI

- [ ] Task: Optymalizacja długości historii
  - **Opis:** Sprawdzenie czy limit 10-15 wiadomości jest optymalny
  - **Pliki:** `src/agents/mathTutor/index.ts`, dokumentacja
  - **Zależności:** Wymaga ukończenia analizy tokenów
  - **Priorytet:** NISKI

- [ ] Task: Optymalizacja promptu systemowego
  - **Opis:** Skrócenie promptu systemowego bez utraty jakości
  - **Pliki:** `src/agents/mathTutor/prompts.ts`
  - **Zależności:** Wymaga ukończenia analizy tokenów
  - **Priorytet:** NISKI

**Kryteria akceptacji:**

- ✅ Użycie API jest monitorowane - **UKOŃCZONE**
- ✅ Koszty są kontrolowane i przewidywalne - **UKOŃCZONE** (miesięczne limity)
- ⏳ Analiza użycia tokenów jest udokumentowana - **DO ZROBIENIA**
- ⏳ Historia jest ograniczona do optymalnej liczby wiadomości - **DO ZROBIENIA**
- ⏳ Prompt systemowy jest zoptymalizowany - **DO ZROBIENIA**

---

## Status projektu

**Postęp:** ~92% ukończone - **MVP+ gotowe i zabezpieczone!**

- ✅ **EPIK 1 (Bezpieczeństwo):** 100% - ukończone (+ zabezpieczenia treści + miesięczne limity tokenów)
- ✅ **EPIK 2 (Offline + PWA):** 100% - ukończone
- ⚠️ **EPIK 3 (Testowanie):** 83% - unit testy ✅ (48/48), testy manualne ✅ (6/6), optymalizacja ❌

---

## Podsumowanie tygodnia (19-23 stycznia 2026)

### Osiągnięcia

**Naprawy i poprawki (22 stycznia):**
- ✅ Naprawiono wyświetlanie znaków matematycznych (`/`, `\`, `*`, `+`, `-`, `=`, `^`, `_`, `$`)
- ✅ Naprawiono wyświetlanie ułamków (`1/2`, `3/4` itp.)
- ✅ Naprawiono problem z pętlą pierwszego powitania (dodano `initialGreetingSentRef`)
- ✅ Dodano filtrowanie historii (sesje z tylko 1 wiadomością nie są zapisywane)
- ✅ Weryfikacja testów - wszystkie 48/48 przechodzą ✅

**Status projektu:**
- Projekt jest w ~95% ukończony
- MVP+ gotowe i zabezpieczone
- Wszystkie testy jednostkowe działają poprawnie (48/48 ✅)
- Wszystkie testy manualne przeszły pomyślnie (6/6 ✅)
- Aplikacja jest stabilna i gotowa do wdrożenia

---

## Osiągnięcia

Podczas realizacji wykonano **więcej** niż było w pierwotnym planie:

1. ✅ **PWA (Progressive Web App)** - pełna implementacja z:
   - Service Worker + Workbox
   - Cache strategies dla różnych typów zasobów
   - Manifest.webmanifest i ikony
   - Możliwość instalacji jako aplikacja

2. ✅ **Zaawansowana obsługa offline**:
   - OnlineProvider z Context API
   - Test faktycznego dostępu do sieci (nie tylko `navigator.onLine`)
   - OfflineIndicator z auto-hide
   - Blokowanie UI gdy offline

3. ✅ **Accessibility (a11y)**:
   - Skip link
   - ARIA labels i regions
   - Semantyczny HTML
   - aria-live dla dynamicznych aktualizacji
