# Analiza planu integracji i propozycja wdrożenia 🎯

Data utworzenia: 8 grudnia 2025
Ostatnia aktualizacja: 15 stycznia 2026
Projekt: Chat-with-Hero (Tutor with AI)

> **📝 Uwaga:** Ten dokument zastąpił i rozszerzył `PLAN_Integrity_with_Mistral_AI.md`.
> Stary plan został przeniesiony do `docs/archive/` jako dokumentacja historyczna.

---

## 🎯 Cel projektu

Połączenie aplikacji edukacyjnej z AI Mistral w celu stworzenia interaktywnego korepetytora, który pomoże nastolatkom w nauce poprzez personalizowane rozmowy dostosowane do ich zainteresowań i poziomu wiedzy.

---

## 🛠️ Tech Stack

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

## 📚 Dokumentacja techniczna - Struktura projektu

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

### PWA - Cache Strategy (Service Worker)

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

## 📈 Aktualny status projektu

**Postęp ogólny:** ~75% ukończone (MVP+ gotowe!)

### ✅ Ukończone funkcjonalności:

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

- ✅ Testy jednostkowe (13/13 ✅) - Vitest + React Testing Library:
  - Chat.test.tsx (9 testów)
  - NameInput.test.tsx (2 testy)
  - useDebounce.test.ts (2 testy)

### 🔍 Historia weryfikacji i aktualizacji:

- **15 stycznia 2026** - **[AUDYT]** Pełna weryfikacja kodu vs dokumentacja - zaktualizowano status
- **15 stycznia 2026** - Poprawki SEO + lekka optymalizacja wydajności, Lighthouse: Perf 78 / SEO 100
- **15 stycznia 2026** - Poprawki a11y (skip link + main, etykiety pól, aria-live, semantyka list/regionów, usunięcie zagnieżdżonych elementów interaktywnych)
- **8 stycznia 2026** - Ukończono FEATURE 3.2 (Testowanie edge cases) - testy jednostkowe (13/13 ✅)
- **7 stycznia 2026** - Dokończono FEATURE 1.3 (Debouncing) - dodano hook `useDebounce`
- **7 stycznia 2026** - Pełna weryfikacja kodu - status potwierdzony jako aktualny
- **9 grudnia 2025** - Utworzenie dokumentu i implementacja FEATURE 1.1, 1.2

### ⚠️ Częściowo zaimplementowane:

- ⚠️ **Brak** - wszystkie funkcjonalności są w pełni zaimplementowane lub nie rozpoczęte

### 🎯 W trakcie realizacji:

- **Brak** - wszystkie rozpoczęte zadania są ukończone

### ❌ Do zrobienia (pozostałe zadania):

- ❌ Filtrowanie treści (FEATURE 1.4) - **priorytet WYSOKI**
- ❌ Dokumentacja testowania podstawowego flow (FEATURE 3.1) - **priorytet ŚREDNI**
- ❌ Optymalizacja kosztów API (FEATURE 3.3) - **priorytet NISKI**

---

## 🎯 Plan wdrożenia - Features do zrobienia

### ✅ EPIK 1: Bezpieczeństwo i stabilność - **75% ukończone**

- ✅ FEATURE 1.1: Rate limiting (50 zapytań/sesja)
- ✅ FEATURE 1.2: Timer sesji (30 min, 50 wiadomości)
- ✅ FEATURE 1.3: Debouncing (ochrona przed wielokrotnym wysłaniem)
- ❌ FEATURE 1.4: Filtrowanie treści - **DO ZROBIENIA**

---

#### FEATURE 1.4: Filtrowanie treści i bezpieczeństwo

**User Stories:**

1. Jako rodzic chcę mieć pewność że aplikacja filtruje nieodpowiednie treści żeby chronić moje dziecko
2. Jako uczeń chcę otrzymywać tylko bezpieczne odpowiedzi żeby czuć się komfortowo

**Tasks:**

- [ ] Task: Stwórz listę słów kluczowych do filtrowania
  - **Opis:** Lista nieodpowiednich słów kluczowych w `config.ts`
  - **Pliki:** `src/agents/mathTutor/config.ts`

- [ ] Task: Implementuj funkcję filtrowania w `index.ts`
  - **Opis:** Sprawdzanie wiadomości użytkownika pod kątem nieodpowiednich treści
  - **Pliki:** `src/agents/mathTutor/index.ts`
  - **Zależności:** Wymaga ukończenia listy słów kluczowych

- [ ] Task: Dodaj przyjazny komunikat o filtrowaniu
  - **Opis:** Komunikat dla użytkownika gdy wiadomość zostanie zablokowana
  - **Pliki:** `src/components/Chat.tsx`
  - **Zależności:** Wymaga ukończenia funkcji filtrowania

**Kryteria akceptacji:**

- ✅ Nieodpowiednie treści są wykrywane i blokowane
- ✅ Użytkownik otrzymuje przyjazny komunikat
- ✅ Filtrowanie działa zarówno dla wiadomości użytkownika jak i odpowiedzi AI (opcjonalnie)

---

### ✅ EPIK 2: Obsługa offline + PWA - **100% ukończone**

- ✅ FEATURE 2.1: Pełna obsługa offline (OnlineProvider, OfflineIndicator, PWA cache)

---

### ⚠️ EPIK 3: Testowanie i optymalizacja - **33% ukończone**

- ❌ FEATURE 3.1: Dokumentacja testowania podstawowego flow - **DO ZROBIENIA**
- ✅ FEATURE 3.2: Testowanie edge cases (13 testów jednostkowych)
- ❌ FEATURE 3.3: Optymalizacja kosztów API - **DO ZROBIENIA**

---

#### FEATURE 3.1: Testowanie podstawowego flow

**User Stories:**

1. Jako developer chcę mieć pewność że podstawowe scenariusze działają poprawnie żeby móc wdrożyć aplikację
2. Jako użytkownik chcę mieć pewność że aplikacja działa stabilnie żeby móc na niej polegać

**Tasks:**

- [ ] Task: Test scenariusza - proste pytanie → odpowiedź
  - **Opis:** Test podstawowego flow: użytkownik zadaje pytanie, otrzymuje odpowiedź
  - **Pliki:** Dokumentacja testów (nowy plik `TESTS.md` lub w planie)

- [ ] Task: Test scenariusza - kontynuacja rozmowy
  - **Opis:** Test że AI pamięta kontekst z poprzednich wiadomości
  - **Pliki:** Dokumentacja testów

- [ ] Task: Test scenariusza - personalizacja
  - **Opis:** Test że AI używa zainteresowań użytkownika w odpowiedziach
  - **Pliki:** Dokumentacja testów

- [ ] Task: Test scenariusza - długa konwersacja
  - **Opis:** Test że historia działa poprawnie w długich rozmowach
  - **Pliki:** Dokumentacja testów

**Kryteria akceptacji:**

- ✅ Wszystkie scenariusze testowe są udokumentowane
- ✅ Wszystkie scenariusze testowe przechodzą pomyślnie
- ✅ Wyniki testów są zapisane w dokumentacji

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

## 📊 Status projektu

**Postęp:** ~70% ukończone - **MVP+ gotowe!**

- ⚠️ **EPIK 1 (Bezpieczeństwo):** 75% - brakuje filtrowania treści
- ✅ **EPIK 2 (Offline + PWA):** 100% - ukończone
- ⚠️ **EPIK 3 (Testowanie):** 33% - unit testy ✅, dokumentacja i optymalizacja ❌

---

## 🚀 Następne kroki

### 🔴 Priorytet WYSOKI: FEATURE 1.4 - Filtrowanie treści

- Lista słów kluczowych do filtrowania
- Funkcja sprawdzania w `index.ts`
- Komunikaty dla użytkownika

### 🟡 Priorytet ŚREDNI: FEATURE 3.1 - Dokumentacja testów

- Dokumentacja scenariuszy testowych
- Przypadki testowe do weryfikacji manualnej

### 🟢 Priorytet NISKI: FEATURE 3.3 - Optymalizacja kosztów

- Analiza użycia tokenów
- Optymalizacja długości historii
- Monitorowanie użycia API

---

## 🎉 Osiągnięcia (ponad plan!)

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
