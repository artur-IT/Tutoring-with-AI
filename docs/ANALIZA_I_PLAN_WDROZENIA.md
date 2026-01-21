# Analiza planu integracji i propozycja wdrożenia 🎯

Data utworzenia: 8 grudnia 2025
Ostatnia aktualizacja: 20 stycznia 2026
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
  - [EPIK 3: Testowanie i optymalizacja](#epik-3-testowanie-i-optymalizacja)
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

**Postęp ogólny:** ~75% ukończone (MVP+ gotowe!)

### Ukończone funkcjonalności

**Bezpieczeństwo i kontrola:**

- ✅ Rate limiting (50 zapytań na sesję) - pełna implementacja
- ✅ Timer sesji (30 minut) - automatyczne zakończenie
- ✅ Limit wiadomości (50 pytań) - automatyczne sprawdzanie
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

**Testowanie:**

- ✅ Testy jednostkowe (46/46 ✅) - Vitest + React Testing Library:
  - Chat.test.tsx (9 testów)
  - NameInput.test.tsx (2 testy)
  - useDebounce.test.ts (2 testy)
  - contentFilter.test.ts (33 testy) - zabezpieczenia treści

### Historia weryfikacji i aktualizacji

- **20 stycznia 2026** - Ukończono FEATURE 1.4 (Filtrowanie treści) - sanityzacja HTML, filtr wulgaryzmów, prompt injection, dane osobowe (33 testy ✅)
- **20 stycznia 2026** - Utworzono dokumentację testów FEATURE 3.1 w `docs/TESTS_PLAN.md` - 6 scenariuszy podstawowego flow
- **15 stycznia 2026** - **[AUDYT]** Pełna weryfikacja kodu vs dokumentacja - zaktualizowano status
- **15 stycznia 2026** - Poprawki SEO + lekka optymalizacja wydajności, Lighthouse: Perf 78 / SEO 100
- **15 stycznia 2026** - Poprawki a11y (skip link + main, etykiety pól, aria-live, semantyka list/regionów, usunięcie zagnieżdżonych elementów interaktywnych)
- **8 stycznia 2026** - Ukończono FEATURE 3.2 (Testowanie edge cases) - testy jednostkowe (13/13 ✅)
- **7 stycznia 2026** - Dokończono FEATURE 1.3 (Debouncing) - dodano hook `useDebounce`
- **7 stycznia 2026** - Pełna weryfikacja kodu - status potwierdzony jako aktualny
- **9 grudnia 2025** - Utworzenie dokumentu i implementacja FEATURE 1.1, 1.2

### Częściowo zaimplementowane

- ⚠️ **Brak** - wszystkie funkcjonalności są w pełni zaimplementowane lub nie rozpoczęte

### W trakcie realizacji

- 📝 **FEATURE 3.1** - Dokumentacja testowania podstawowego flow - dokumentacja utworzona, oczekuje na wykonanie testów manualnych

### Do zrobienia (pozostałe zadania)

- ❌ Optymalizacja kosztów API (FEATURE 3.3) - **priorytet NISKI**

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

### EPIK 3: Testowanie i optymalizacja

**Status:** ⚠️ 66% ukończone

- 📝 FEATURE 3.1: Dokumentacja testowania podstawowego flow - **W TRAKCIE** (dokumentacja gotowa, oczekuje na wykonanie)
- ✅ FEATURE 3.2: Testowanie edge cases (46 testów jednostkowych: 13 edge cases + 33 content security)
- ❌ FEATURE 3.3: Optymalizacja kosztów API - **DO ZROBIENIA**

---

#### 📝 FEATURE 3.1: Testowanie podstawowego flow - **W TRAKCIE**

**Status:** Dokumentacja gotowa, oczekuje na wykonanie testów manualnych

**User Stories:**

1. Jako developer chcę mieć pewność że podstawowe scenariusze działają poprawnie żeby móc wdrożyć aplikację
2. Jako użytkownik chcę mieć pewność że aplikacja działa stabilnie żeby móc na niej polegać

**Udokumentowane scenariusze testowe (6):**

- ✅ SCENARIUSZ 1: Proste pytanie → odpowiedź (priorytet WYSOKI)
- ✅ SCENARIUSZ 2: Kontynuacja rozmowy - pamięć kontekstu (priorytet WYSOKI)
- ✅ SCENARIUSZ 3: Personalizacja - zainteresowania (priorytet WYSOKI)
- ✅ SCENARIUSZ 4: Długa konwersacja - 10+ wiadomości (priorytet ŚREDNI)
- ✅ SCENARIUSZ 5: Zapisywanie i wczytywanie historii (priorytet ŚREDNI)
- ✅ SCENARIUSZ 6: AI odmawia odpowiedzi na pytania spoza przedmiotu (priorytet WYSOKI)

**Pliki:**
- `docs/TESTS_PLAN.md` - pełna dokumentacja scenariuszy testowych (FEATURE 3.1 + 3.2)

**Do wykonania:**
- ⏳ Wykonać testy manualne zgodnie ze scenariuszami
- ⏳ Zapisać wyniki w tabeli w `TESTS_PLAN.md`
- ⏳ Udokumentować zidentyfikowane problemy

**Kryteria akceptacji:**

- ✅ Wszystkie scenariusze testowe są udokumentowane
- ⏳ Wszystkie scenariusze testowe przechodzą pomyślnie
- ⏳ Wyniki testów są zapisane w dokumentacji

---

#### FEATURE 3.3: Optymalizacja kosztów i wydajności

**User Stories:**

1. Jako administrator chcę monitorować użycie API żeby kontrolować koszty
2. Jako użytkownik chcę mieć szybkie odpowiedzi żeby nie tracić czasu

**Tasks:**

- [ ] Task: Analiza użycia tokenów
  - **Opis:** Sprawdzenie ile tokenów jest używanych w typowej sesji
  - **Pliki:** Dokumentacja optymalizacji (nowy plik `OPTIMIZATION.md`)

- [ ] Task: Optymalizacja długości historii
  - **Opis:** Sprawdzenie czy limit 10-15 wiadomości jest optymalny
  - **Pliki:** `src/agents/mathTutor/index.ts`, dokumentacja
  - **Zależności:** Wymaga ukończenia analizy tokenów

- [ ] Task: Optymalizacja promptu systemowego
  - **Opis:** Skrócenie promptu systemowego bez utraty jakości
  - **Pliki:** `src/agents/mathTutor/prompts.ts`
  - **Zależności:** Wymaga ukończenia analizy tokenów

- [ ] Task: Monitorowanie użycia API
  - **Opis:** Logowanie użycia tokenów i kosztów w konsoli (lub dashboard)
  - **Pliki:** `src/pages/api/chat.ts`, `src/agents/mathTutor/index.ts`
  - **Zależności:** Wymaga ukończenia optymalizacji

**Kryteria akceptacji:**

- ✅ Analiza użycia tokenów jest udokumentowana
- ✅ Historia jest ograniczona do optymalnej liczby wiadomości
- ✅ Prompt systemowy jest zoptymalizowany
- ✅ Użycie API jest monitorowane
- ✅ Koszty są kontrolowane i przewidywalne

---

## Status projektu

**Postęp:** ~90% ukończone - **MVP+ gotowe i zabezpieczone!**

- ✅ **EPIK 1 (Bezpieczeństwo):** 100% - ukończone (+ zabezpieczenia treści)
- ✅ **EPIK 2 (Offline + PWA):** 100% - ukończone
- ⚠️ **EPIK 3 (Testowanie):** 66% - unit testy ✅, dokumentacja flow ⏳, optymalizacja ❌

---

## Następne kroki

### 🟡 Priorytet ŚREDNI: FEATURE 3.1 - Wykonanie testów manualnych

**Status:** Dokumentacja gotowa, oczekuje na wykonanie

**Co zrobić:**
1. Wykonać 6 scenariuszy testowych z `docs/TESTS_PLAN.md`:
   - SCENARIUSZ 1: Proste pytanie → odpowiedź
   - SCENARIUSZ 2: Kontynuacja rozmowy
   - SCENARIUSZ 3: Personalizacja (zainteresowania)
   - SCENARIUSZ 4: Długa konwersacja (10+ wiadomości)
   - SCENARIUSZ 5: Historia (zapis i wczytanie)
   - SCENARIUSZ 6: AI odmawia (pytania off-topic)

2. Zapisać wyniki w tabeli w `docs/TESTS_PLAN.md`
3. Udokumentować problemy (jeśli wystąpią)
4. Zaktualizować status w `ANALIZA_I_PLAN_WDROZENIA.md`

**Czas:** ~1-2 godziny

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

4. ✅ **Lighthouse score:** Performance 78 / SEO 100 / Accessibility 98
