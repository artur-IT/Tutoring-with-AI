# Analiza planu integracji i propozycja wdrożenia 🎯

Data utworzenia: 8 grudnia 2025  
Ostatnia aktualizacja: 9 grudnia 2025  
Projekt: Chat-with-Hero (Tutor with AI)

---

## 📈 Aktualny status projektu

**Postęp ogólny:** ~35% ukończone

### ✅ Ukończone funkcjonalności:

- ✅ Rate limiting (50 zapytań na sesję) - pełna implementacja
- ✅ Timer sesji (30 minut) - automatyczne zakończenie
- ✅ Limit wiadomości (50 pytań) - automatyczne sprawdzanie
- ✅ Blokowanie przycisku podczas wysyłania
- ✅ Wyświetlanie wybranego tematu w historii rozmowy

### ⚠️ Częściowo zaimplementowane:

- ⚠️ Debouncing - przycisk jest blokowany, ale brak dedykowanego debouncing z opóźnieniem

### ❌ Do zrobienia:

- ❌ Filtrowanie treści (FEATURE 1.4)
- ❌ Obsługa offline (FEATURE 2.1)
- ❌ Testowanie (FEATURE 3.1, 3.2)
- ❌ Optymalizacja (FEATURE 3.3)

---

## 📊 Analiza obecnego stanu

### ✅ Co jest już zaimplementowane (kroki 1-17)

**Faza przygotowawcza:**

- ✅ Konfiguracja Mistral AI (konto, API key, .env)
- ✅ Instalacja biblioteki `@mistralai/mistralai`
- ✅ Zabezpieczenie klucza API

**Faza struktury:**

- ✅ Folder `src/agents/mathTutor/` z pełną strukturą
- ✅ `config.ts` - konfiguracja agenta
- ✅ `prompts.ts` - prompty systemowe
- ✅ `types.ts` - typy TypeScript
- ✅ `index.ts` - główna logika z integracją Mistral

**Faza backend:**

- ✅ Endpoint `/api/chat.ts`
- ✅ Wywołanie Mistral API
- ✅ Podstawowa walidacja danych
- ✅ Obsługa błędów

**Faza frontend:**

- ✅ Stan w `Chat.tsx` (messages, loading, error)
- ✅ Funkcja wysyłania wiadomości
- ✅ Dynamiczne wyświetlanie wiadomości
- ✅ Loading i error states
- ✅ Auto-scroll do ostatniej wiadomości

**Faza personalizacji:**

- ✅ Wykorzystanie danych studenta w promptach
- ✅ Zapisywanie historii w localStorage
- ✅ System wykrywania niezgodności tematu
- ✅ Wyświetlanie wybranego tematu w historii rozmowy (zamiast pierwszej wiadomości użytkownika)

**Faza bezpieczeństwa i kontroli:**

- ✅ Rate limiting (50 zapytań na sesję) - pełna implementacja w API i frontend
- ✅ Timer sesji (30 minut) - odliczanie czasu z automatycznym zakończeniem
- ✅ Limit wiadomości (50 pytań) - automatyczne sprawdzanie i zakończenie sesji
- ✅ Blokowanie przycisku podczas wysyłania - ochrona przed wielokrotnym kliknięciem
- ✅ Wyświetlanie pozostałych zapytań i czasu sesji w UI

---

## ❌ Czego brakuje w planie i implementacji

### 1. Funkcjonalności wspomniane w planie, ale nie zaimplementowane:

#### 1.1 Rate limiting (ETAP 3, Krok 3.3)

- **Status:** ✅ ZAIMPLEMENTOWANE
- **Co to:** Ograniczenie liczby zapytań na użytkownika/sesję
- **Dlaczego ważne:** Ochrona przed nadużyciami, kontrola kosztów API
- **Szczegóły implementacji:**
  - System rate limiting w `/api/chat.ts` z limitem 50 zapytań na sesję
  - Licznik pozostałych zapytań w `Chat.tsx`
  - Wyświetlanie pozostałych zapytań w UI
  - Obsługa przekroczenia limitu z komunikatem i zakończeniem sesji

#### 1.2 Obsługa offline (ETAP 6, Krok 6.2)

- **Status:** Wspomniane w planie, brak implementacji
- **Co to:** Działanie aplikacji bez połączenia z internetem
- **Dlaczego ważne:** Lepsze UX, możliwość kontynuacji nauki offline

#### 1.3 Debouncing dla szybkiego klikanie "Send" (ETAP 6, Krok 6.2)

- **Status:** Częściowo zaimplementowane
- **Co to:** Zapobieganie wielokrotnemu wysyłaniu tej samej wiadomości
- **Dlaczego ważne:** Oszczędność tokenów, lepsze UX
- **Co jest zaimplementowane:**
  - Przycisk "Send" jest zablokowany podczas wysyłania (`disabled={isLoading}`)
  - Przycisk jest zablokowany gdy input jest pusty
  - Wizualna informacja o stanie (disabled opacity)
- **Co brakuje:**
  - Dedykowany debouncing z opóźnieniem 500ms (obecnie blokada działa tylko podczas `isLoading`)

#### 1.4 Timer sesji (ETAP 5, Krok 5.3)

- **Status:** ✅ ZAIMPLEMENTOWANE
- **Co to:** Kontrola czasu i liczby wiadomości w sesji
- **Dlaczego ważne:** Kontrola czasu nauki, kontrola kosztów
- **Szczegóły implementacji:**
  - Timer odliczający czas sesji (30 minut)
  - Pasek postępu pokazujący pozostały czas
  - Limit wiadomości (50 pytań) z automatycznym sprawdzaniem
  - Automatyczne zakończenie sesji po przekroczeniu limitu czasu lub wiadomości
  - Zapisanie historii przed zakończeniem
  - Komunikat alert przed zakończeniem i przekierowaniem

#### 1.5 Filtrowanie niewłaściwych słów kluczowych (ETAP 5, Krok 5.2)

- **Status:** Wspomniane w planie, brak implementacji
- **Co to:** Wykrywanie i blokowanie nieodpowiednich treści
- **Dlaczego ważne:** Bezpieczeństwo dla nastolatków

### 2. Faza testów (ETAP 6) - całkowicie brakuje:

#### 2.1 Testowanie podstawowego flow (Krok 6.1)

- **Status:** ❌ Nie wykonane
- **Co to:** Testy scenariuszy podstawowych
- **Dlaczego ważne:** Pewność że aplikacja działa poprawnie

#### 2.2 Testowanie edge cases (Krok 6.2)

- **Status:** ❌ Nie wykonane
- **Co to:** Testy przypadków brzegowych
- **Dlaczego ważne:** Stabilność aplikacji w różnych sytuacjach

#### 2.3 Optymalizacja kosztów i wydajności (Krok 6.3)

- **Status:** ❌ Nie wykonane
- **Co to:** Analiza i optymalizacja użycia API
- **Dlaczego ważne:** Kontrola kosztów, lepsza wydajność

### 3. Braki w dokumentacji planu:

#### 3.1 Brak szczegółowych kryteriów akceptacji

- Plan nie zawiera jasnych kryteriów "Definition of Done" dla każdego kroku

#### 3.2 Brak szacunków czasowych

- Plan nie zawiera szacunków czasu dla poszczególnych zadań

#### 3.3 Brak priorytetyzacji

- Wszystkie zadania traktowane jako równie ważne

---

## 🎯 Propozycja wdrożenia (Metoda 1: User Stories + Metoda 2: Epiki → Features → Tasks)

### EPIK 1: Ukończenie funkcjonalności bezpieczeństwa i stabilności

**Cel:** Zapewnienie bezpieczeństwa, stabilności i kontroli kosztów aplikacji

#### FEATURE 1.1: Rate limiting i kontrola zapytań

**User Stories:**

1. Jako administrator chcę ograniczyć liczbę zapytań na użytkownika żeby kontrolować koszty API
2. Jako uczeń chcę widzieć ile zapytań zostało mi w sesji żeby wiedzieć ile mogę jeszcze zadać pytań

**Tasks:**

- [x] Task: Stwórz system rate limiting w `/api/chat.ts`
  - **Opis:** Implementacja limitu zapytań na sesję (np. 50 zapytań)
  - **Pliki:** `src/pages/api/chat.ts`
  - **Status:** ✅ ZAIMPLEMENTOWANE

- [x] Task: Dodaj licznik zapytań w `Chat.tsx`
  - **Opis:** Wyświetlanie pozostałych zapytań w sesji
  - **Pliki:** `src/components/Chat.tsx`
  - **Status:** ✅ ZAIMPLEMENTOWANE

- [x] Task: Dodaj komunikat o przekroczeniu limitu
  - **Opis:** Przyjazny komunikat gdy limit zapytań zostanie przekroczony
  - **Pliki:** `src/components/Chat.tsx`
  - **Status:** ✅ ZAIMPLEMENTOWANE

**Kryteria akceptacji:**

- ✅ Limit zapytań jest egzekwowany w API
- ✅ Użytkownik widzi licznik pozostałych zapytań
- ✅ Po przekroczeniu limitu wyświetla się komunikat
- ✅ Komunikat przekierowuje do wyboru nowej sesji

---

#### FEATURE 1.2: Timer sesji i kontrola czasu

**User Stories:**

1. Jako uczeń chcę wiedzieć ile czasu zostało mi w sesji żeby zaplanować naukę
2. Jako administrator chcę ograniczyć czas sesji żeby kontrolować koszty

**Tasks:**

- [x] Task: Implementuj timer sesji w `Chat.tsx`
  - **Opis:** Odliczanie czasu sesji (30 minut) z wykorzystaniem istniejącego paska postępu
  - **Pliki:** `src/components/Chat.tsx`
  - **Status:** ✅ ZAIMPLEMENTOWANE

- [x] Task: Dodaj limit wiadomości (50 pytań)
  - **Opis:** Sprawdzanie liczby wiadomości i zakończenie sesji po przekroczeniu
  - **Pliki:** `src/components/Chat.tsx`
  - **Status:** ✅ ZAIMPLEMENTOWANE

- [x] Task: Automatyczne zakończenie sesji
  - **Opis:** Zapisanie historii i przekierowanie po przekroczeniu limitu
  - **Pliki:** `src/components/Chat.tsx`
  - **Status:** ✅ ZAIMPLEMENTOWANE

**Kryteria akceptacji:**

- ✅ Timer odlicza czas sesji (30 minut)
- ✅ Pasek postępu pokazuje pozostały czas
- ✅ Sesja kończy się po 30 minutach lub 50 wiadomościach
- ✅ Historia jest zapisywana przed zakończeniem
- ✅ Użytkownik widzi komunikat przed zakończeniem

---

#### FEATURE 1.3: Debouncing i ochrona przed błędami użytkownika

**User Stories:**

1. Jako uczeń chcę być chroniony przed przypadkowym wysłaniem wielu wiadomości żeby nie tracić zapytań
2. Jako uczeń chcę widzieć że moja wiadomość została wysłana żeby nie klikać wielokrotnie

**Tasks:**

- [ ] Task: Dodaj debouncing do przycisku "Send"
  - **Opis:** Zapobieganie wielokrotnemu wysłaniu wiadomości (opóźnienie 500ms)
  - **Pliki:** `src/components/Chat.tsx`
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Brak
  - **Status:** ⚠️ CZĘŚCIOWO - brak dedykowanego debouncing, ale przycisk jest blokowany podczas `isLoading`

- [x] Task: Zablokuj przycisk podczas wysyłania
  - **Opis:** Wizualne i funkcjonalne zablokowanie przycisku podczas requestu
  - **Pliki:** `src/components/Chat.tsx`
  - **Status:** ✅ ZAIMPLEMENTOWANE

**Kryteria akceptacji:**

- ✅ Przycisk "Send" jest zablokowany podczas wysyłania
- ⚠️ Szybkie klikanie nie powoduje wielokrotnego wysłania (działa przez `isLoading`, ale brak dedykowanego debouncing)
- ✅ Użytkownik widzi wizualną informację o stanie wysyłania

---

#### FEATURE 1.4: Filtrowanie treści i bezpieczeństwo

**User Stories:**

1. Jako rodzic chcę mieć pewność że aplikacja filtruje nieodpowiednie treści żeby chronić moje dziecko
2. Jako uczeń chcę otrzymywać tylko bezpieczne odpowiedzi żeby czuć się komfortowo

**Tasks:**

- [ ] Task: Stwórz listę słów kluczowych do filtrowania
  - **Opis:** Lista nieodpowiednich słów kluczowych w `config.ts`
  - **Pliki:** `src/agents/mathTutor/config.ts`
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Brak

- [ ] Task: Implementuj funkcję filtrowania w `index.ts`
  - **Opis:** Sprawdzanie wiadomości użytkownika pod kątem nieodpowiednich treści
  - **Pliki:** `src/agents/mathTutor/index.ts`
  - **Szacowany czas:** 2 godziny
  - **Zależności:** Wymaga ukończenia listy słów kluczowych

- [ ] Task: Dodaj przyjazny komunikat o filtrowaniu
  - **Opis:** Komunikat dla użytkownika gdy wiadomość zostanie zablokowana
  - **Pliki:** `src/components/Chat.tsx`
  - **Szacowany czas:** 30 minut
  - **Zależności:** Wymaga ukończenia funkcji filtrowania

**Kryteria akceptacji:**

- ✅ Nieodpowiednie treści są wykrywane i blokowane
- ✅ Użytkownik otrzymuje przyjazny komunikat
- ✅ Filtrowanie działa zarówno dla wiadomości użytkownika jak i odpowiedzi AI (opcjonalnie)

---

### EPIK 2: Obsługa offline i odporność na błędy

**Cel:** Zapewnienie działania aplikacji w różnych warunkach sieciowych

#### FEATURE 2.1: Obsługa offline

**User Stories:**

1. Jako uczeń chcę móc przeglądać historię rozmów bez internetu żeby uczyć się w każdych warunkach
2. Jako uczeń chcę widzieć że jestem offline żeby wiedzieć dlaczego nie mogę wysłać wiadomości

**Tasks:**

- [ ] Task: Wykrywanie stanu połączenia sieciowego
  - **Opis:** Użycie `navigator.onLine` i event listenerów do wykrywania offline
  - **Pliki:** `src/components/Chat.tsx`
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Brak

- [ ] Task: Blokada wysyłania wiadomości offline
  - **Opis:** Wyłączenie możliwości wysyłania gdy brak internetu
  - **Pliki:** `src/components/Chat.tsx`
  - **Szacowany czas:** 30 minut
  - **Zależności:** Wymaga ukończenia wykrywania stanu połączenia

- [ ] Task: Komunikat o stanie offline
  - **Opis:** Przyjazny komunikat informujący o braku połączenia
  - **Pliki:** `src/components/Chat.tsx`
  - **Szacowany czas:** 30 minut
  - **Zależności:** Wymaga ukończenia blokady wysyłania

- [ ] Task: Możliwość przeglądania historii offline
  - **Opis:** Zapewnienie że historia jest dostępna bez internetu
  - **Pliki:** `src/components/History.tsx`, `src/components/Chat.tsx`
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Wymaga ukończenia komunikatu offline

**Kryteria akceptacji:**

- ✅ Aplikacja wykrywa stan offline
- ✅ Wysyłanie wiadomości jest zablokowane offline
- ✅ Użytkownik widzi komunikat o stanie offline
- ✅ Historia jest dostępna offline
- ✅ Po powrocie online aplikacja automatycznie wznawia działanie

---

### EPIK 3: Testowanie i optymalizacja

**Cel:** Zapewnienie jakości, stabilności i efektywności aplikacji

#### FEATURE 3.1: Testowanie podstawowego flow

**User Stories:**

1. Jako developer chcę mieć pewność że podstawowe scenariusze działają poprawnie żeby móc wdrożyć aplikację
2. Jako użytkownik chcę mieć pewność że aplikacja działa stabilnie żeby móc na niej polegać

**Tasks:**

- [ ] Task: Test scenariusza - proste pytanie → odpowiedź
  - **Opis:** Test podstawowego flow: użytkownik zadaje pytanie, otrzymuje odpowiedź
  - **Pliki:** Dokumentacja testów (nowy plik `TESTS.md` lub w planie)
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Brak

- [ ] Task: Test scenariusza - kontynuacja rozmowy
  - **Opis:** Test że AI pamięta kontekst z poprzednich wiadomości
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Wymaga ukończenia testu prostego pytania

- [ ] Task: Test scenariusza - personalizacja
  - **Opis:** Test że AI używa zainteresowań użytkownika w odpowiedziach
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Wymaga ukończenia testu kontynuacji rozmowy

- [ ] Task: Test scenariusza - długa konwersacja
  - **Opis:** Test że historia działa poprawnie w długich rozmowach
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Wymaga ukończenia testu personalizacji

**Kryteria akceptacji:**

- ✅ Wszystkie scenariusze testowe są udokumentowane
- ✅ Wszystkie scenariusze testowe przechodzą pomyślnie
- ✅ Wyniki testów są zapisane w dokumentacji

---

#### FEATURE 3.2: Testowanie edge cases

**User Stories:**

1. Jako developer chcę przetestować przypadki brzegowe żeby upewnić się że aplikacja jest stabilna
2. Jako użytkownik chcę mieć pewność że aplikacja obsługuje błędy elegancko

**Tasks:**

- [ ] Task: Test - pytanie spoza przedmiotu
  - **Opis:** Test że AI uprzejmie odmawia odpowiedzi na pytania spoza matematyki
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 30 minut
  - **Zależności:** Brak

- [ ] Task: Test - błąd API
  - **Opis:** Test że aplikacja pokazuje przyjazny komunikat gdy API zwraca błąd
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 30 minut
  - **Zależności:** Brak

- [ ] Task: Test - brak internetu
  - **Opis:** Test że aplikacja obsługuje brak połączenia (związane z FEATURE 2.1)
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 30 minut
  - **Zależności:** Wymaga ukończenia FEATURE 2.1

- [ ] Task: Test - bardzo długie pytanie
  - **Opis:** Test że aplikacja waliduje długość wiadomości
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 30 minut
  - **Zależności:** Brak

- [ ] Task: Test - pusta wiadomość
  - **Opis:** Test że aplikacja blokuje wysłanie pustej wiadomości
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 15 minut
  - **Zależności:** Brak

- [ ] Task: Test - szybkie klikanie "Send"
  - **Opis:** Test że debouncing działa poprawnie (związane z FEATURE 1.3)
  - **Pliki:** Dokumentacja testów
  - **Szacowany czas:** 30 minut
  - **Zależności:** Wymaga ukończenia FEATURE 1.3

**Kryteria akceptacji:**

- ✅ Wszystkie edge cases są udokumentowane
- ✅ Wszystkie edge cases są przetestowane
- ✅ Aplikacja obsługuje wszystkie edge cases elegancko
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
  - **Szacowany czas:** 2 godziny
  - **Zależności:** Brak

- [ ] Task: Optymalizacja długości historii
  - **Opis:** Sprawdzenie czy limit 10-15 wiadomości jest optymalny
  - **Pliki:** `src/agents/mathTutor/index.ts`, dokumentacja
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Wymaga ukończenia analizy tokenów

- [ ] Task: Optymalizacja promptu systemowego
  - **Opis:** Skrócenie promptu systemowego bez utraty jakości
  - **Pliki:** `src/agents/mathTutor/prompts.ts`
  - **Szacowany czas:** 2 godziny
  - **Zależności:** Wymaga ukończenia analizy tokenów

- [ ] Task: Monitorowanie użycia API
  - **Opis:** Logowanie użycia tokenów i kosztów w konsoli (lub dashboard)
  - **Pliki:** `src/pages/api/chat.ts`, `src/agents/mathTutor/index.ts`
  - **Szacowany czas:** 1 godzina
  - **Zależności:** Wymaga ukończenia optymalizacji

**Kryteria akceptacji:**

- ✅ Analiza użycia tokenów jest udokumentowana
- ✅ Historia jest ograniczona do optymalnej liczby wiadomości
- ✅ Prompt systemowy jest zoptymalizowany
- ✅ Użycie API jest monitorowane
- ✅ Koszty są kontrolowane i przewidywalne

---

## 📋 Podsumowanie zadań do wykonania

### Priorytet WYSOKI (bezpieczeństwo i stabilność):

1. ✅ Rate limiting i kontrola zapytań (FEATURE 1.1) - **UKOŃCZONE**
2. ✅ Timer sesji i kontrola czasu (FEATURE 1.2) - **UKOŃCZONE**
3. ⚠️ Debouncing (FEATURE 1.3) - **CZĘŚCIOWO** (brak dedykowanego debouncing, ale blokada działa)
4. ❌ Filtrowanie treści (FEATURE 1.4) - **DO ZROBIENIA**

### Priorytet ŚREDNI (UX i odporność):

5. Obsługa offline (FEATURE 2.1)

### Priorytet NISKI (jakość i optymalizacja):

6. Testowanie podstawowego flow (FEATURE 3.1)
7. Testowanie edge cases (FEATURE 3.2)
8. Optymalizacja kosztów (FEATURE 3.3)

---

## ⏱️ Szacowany czas całkowity

**EPIK 1 (Bezpieczeństwo i stabilność):** ~5-6 godzin (zostało)

- FEATURE 1.1: ✅ UKOŃCZONE (~3.5 godziny)
- FEATURE 1.2: ✅ UKOŃCZONE (~4 godziny)
- FEATURE 1.3: ⚠️ CZĘŚCIOWO (~0.5 godziny zostało - dodanie dedykowanego debouncing)
- FEATURE 1.4: ❌ DO ZROBIENIA (~3.5 godziny)

**EPIK 2 (Obsługa offline):** ~3 godziny

- FEATURE 2.1: ~3 godziny

**EPIK 3 (Testowanie i optymalizacja):** ~8-9 godzin

- FEATURE 3.1: ~4 godziny
- FEATURE 3.2: ~2.5 godziny
- FEATURE 3.3: ~6 godziny

**RAZEM:** ~16-18 godzin pracy (zostało)
**UKOŃCZONE:** ~7.5-8 godzin

---

## 🎯 Kolejność wykonania (rekomendowana)

### Faza 1: Bezpieczeństwo (Priorytet WYSOKI)

1. ✅ FEATURE 1.1 - Rate limiting - **UKOŃCZONE**
2. ✅ FEATURE 1.2 - Timer sesji - **UKOŃCZONE**
3. ⚠️ FEATURE 1.3 - Debouncing (dokończyć - dodać dedykowany debouncing)
4. ❌ FEATURE 1.4 - Filtrowanie treści - **DO ZROBIENIA**

### Faza 2: Odporność (Priorytet ŚREDNI)

5. FEATURE 2.1 - Obsługa offline

### Faza 3: Jakość (Priorytet NISKI)

6. FEATURE 3.1 - Testowanie podstawowego flow
7. FEATURE 3.2 - Testowanie edge cases
8. FEATURE 3.3 - Optymalizacja kosztów

---

## 📝 Notatki

- Wszystkie zadania powinny być wykonywane małymi krokami
- Po każdym zadaniu należy przetestować funkcjonalność
- Dokumentacja testów powinna być aktualizowana na bieżąco
- Monitorowanie kosztów API powinno być ciągłe

---

**Status:** 📋 Plan w trakcie wdrożenia  
**Postęp:** ~35% ukończone (2 z 4 głównych features w EPIK 1)

**Następne kroki:**

1. Dokończyć FEATURE 1.3 - dodać dedykowany debouncing (opóźnienie 500ms)
2. Zaimplementować FEATURE 1.4 - Filtrowanie treści
3. Przejść do EPIK 2 (Obsługa offline) lub EPIK 3 (Testowanie)
