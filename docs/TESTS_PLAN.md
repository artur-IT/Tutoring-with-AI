# Plan testów FEATURE 3.2 - Edge Cases

## 📋 Cel testowania

Przetestowanie przypadków brzegowych (edge cases) aby upewnić się, że aplikacja:

- Obsługuje błędy elegancko
- Jest stabilna w nietypowych sytuacjach
- Chroni użytkowników przed błędami

---

## 🎨 Podział testów według narzędzi

Zgodnie z regułami testowania (`.cursor/rules/testing.md`), testy są podzielone na:

1. **Vitest + RTL** - testy jednostkowe i komponentów
2. **Playwright** - testy E2E (całego flow)

---

## 🧪 CZĘŚĆ 1: Testy jednostkowe i komponentów (Vitest + RTL)

### Lokalizacja plików testowych:

```
src/components/
  ├── Chat.tsx
  ├── Chat.test.tsx          ← NOWY PLIK
  ├── NameInput.tsx
  ├── NameInput.test.tsx     ← NOWY PLIK
  └── hooks/
      ├── useDebounce.ts
      └── useDebounce.test.ts ← NOWY PLIK
```

---

### TEST 1: Pusta wiadomość (Chat.test.tsx)

**Priorytet:** WYSOKI

**Co testujemy:** Przycisk "Send" jest zablokowany gdy input jest pusty

**Scenariusz:**

1. Renderuj komponent `Chat`
2. Znajdź input i przycisk "Send"
3. Sprawdź czy przycisk jest disabled gdy input jest pusty
4. Wpisz tekst
5. Sprawdź czy przycisk jest enabled
6. Wyczyść input
7. Sprawdź czy przycisk znowu jest disabled

**Narzędzia:** Vitest + RTL

**Mockowanie:**

- Mock fetch API (tylko network request)
- Mock `window.location.href` dla sprawdzenia przekierowań

**Oczekiwany rezultat:** ✅ Przycisk jest disabled gdy input pusty

---

### TEST 2: Błąd API (Chat.test.tsx)

**Priorytet:** WYSOKI

**Co testujemy:** Wyświetlanie przyjaznego komunikatu błędu gdy API zwraca błąd

**Scenariusz:**

1. Renderuj komponent `Chat`
2. Mockuj fetch żeby zwrócił błąd 500
3. Wpisz wiadomość i wyślij
4. Sprawdź czy wyświetla się komunikat błędu
5. Sprawdź czy komunikat zawiera przyjazny tekst (nie techniczny)

**Narzędzia:** Vitest + RTL

**Mockowanie:**

- Mock fetch API - zwróć error response

**Oczekiwany rezultat:** ✅ Komunikat błędu jest wyświetlony i jest przyjazny

---

### TEST 3: Walidacja limitu wiadomości (Chat.test.tsx)

**Priorytet:** WYSOKI

**Co testujemy:** Walidacja limitu 400 znaków

**Scenariusz:**

1. Renderuj komponent `Chat`
2. Wpisz dokładnie 399 znaków
3. Sprawdź czy przycisk Send jest enabled
4. Sprawdź czy licznik pokazuje "399 / 400" w szarym kolorze
5. Dodaj 1 znak (400 znaków)
6. Sprawdź czy:
   - Przycisk Send jest disabled
   - Textarea ma czerwoną ramkę (border-red-500)
   - Licznik pokazuje "400 / 400" w czerwonym kolorze
7. Dodaj kolejny znak (401 znaków)
8. Sprawdź te same warunki (disabled, czerwona ramka, czerwony licznik)

**Narzędzia:** Vitest + RTL

**Mockowanie:**

- Mock fetch API

**Oczekiwany rezultat:** ✅ Walidacja działa poprawnie przy >= 400 znakach

---

### TEST 4: Szybkie klikanie "Send" - debouncing (useDebounce.test.ts)

**Priorytet:** ŚREDNI

**Co testujemy:** Hook `useDebounce` działa poprawnie

**Scenariusz:**

1. Stwórz test hook'a `useDebounce`
2. Wywołaj funkcję wielokrotnie szybko (np. 10 razy w 100ms)
3. Sprawdź czy funkcja została wykonana tylko raz
4. Sprawdź czy opóźnienie wynosi 500ms

**Narzędzia:** Vitest + `@testing-library/react-hooks` (lub `renderHook` z RTL)

**Mockowanie:**

- Mock `setTimeout` i `clearTimeout` (Vitest fake timers)

**Oczekiwany rezultat:** ✅ Funkcja wykonuje się raz mimo wielokrotnego wywołania

---

### TEST 5: Blokowanie przycisku podczas wysyłania (Chat.test.tsx)

**Priorytet:** WYSOKI

**Co testujemy:** Przycisk "Send" jest disabled podczas `isLoading`

**Scenariusz:**

1. Renderuj komponent `Chat`
2. Wpisz wiadomość
3. Wyślij (mockuj opóźnioną odpowiedź API)
4. Sprawdź czy przycisk jest disabled podczas oczekiwania
5. Poczekaj na odpowiedź
6. Sprawdź czy przycisk jest znowu enabled

**Narzędzia:** Vitest + RTL

**Mockowanie:**

- Mock fetch z opóźnieniem (Promise)

**Oczekiwany rezultat:** ✅ Przycisk jest disabled podczas loading

---

### TEST 6: Walidacja imienia użytkownika (NameInput.test.tsx)

**Priorytet:** ŚREDNI

**Co testujemy:** Walidacja pustego imienia (edge case)

**Scenariusz:**

1. Renderuj komponent `NameInput`
2. Spróbuj wysłać formularz bez imienia
3. Sprawdź czy przycisk jest disabled lub wyświetla się błąd
4. Wpisz imię (tylko spacje)
5. Sprawdź czy jest walidacja

**Narzędzia:** Vitest + RTL

**Mockowanie:** Brak (czysty komponent)

**Oczekiwany rezultat:** ✅ Puste imię jest blokowane

---

### TEST 10: Licznik znaków (Chat.test.tsx)

**Priorytet:** ŚREDNI

**Co testujemy:** Licznik znaków aktualizuje się dynamicznie i zmienia kolor

**Scenariusz:**

1. Renderuj komponent `Chat`
2. Znajdź licznik (powinien pokazywać "0 / 400")
3. Wpisz "Test" (4 znaki)
4. Sprawdź czy licznik pokazuje "4 / 400"
5. Wpisz więcej tekstu do 399 znaków
6. Sprawdź czy licznik jest szary (text-gray-500)
7. Dodaj 1 znak (400 znaków)
8. Sprawdź czy licznik zmienił kolor na czerwony (text-red-500)

**Narzędzia:** Vitest + RTL

**Mockowanie:** Mock fetch API

**Oczekiwany rezultat:** ✅ Licznik dynamicznie aktualizuje się i zmienia kolor

---

### TEST 11: Textarea wieloliniowa (Chat.test.tsx)

**Priorytet:** NISKI

**Co testujemy:** Textarea obsługuje Enter i Shift+Enter

**Scenariusz:**

1. Renderuj komponent `Chat`
2. Wpisz "Line 1"
3. Symuluj Shift+Enter
4. Wpisz "Line 2"
5. Sprawdź czy textarea zawiera "\n" (nowa linia)
6. Sprawdź czy wiadomość NIE została wysłana
7. Naciśnij Enter (bez Shift)
8. Sprawdź czy wiadomość została wysłana

**Narzędzia:** Vitest + RTL

**Mockowanie:** Mock fetch API

**Oczekiwany rezultat:** ✅ Shift+Enter dodaje nową linię, Enter wysyła

**⚠️ Uwaga:** Test może być trudny w RTL, może być lepiej zaimplementować jako E2E

---

## 🎭 CZĘŚĆ 2: Testy E2E (Playwright)

### Lokalizacja plików testowych:

```
tests/                        ← NOWY FOLDER
  ├── chat-edge-cases.spec.ts ← NOWY PLIK
  └── offline.spec.ts         ← NOWY PLIK
```

---

### TEST 7: Pytanie spoza przedmiotu (Playwright)

**Priorytet:** WYSOKI

**Co testujemy:** AI odmawia odpowiedzi na pytania niezwiązane z matematyką

**Scenariusz:**

1. Otwórz aplikację w przeglądarce
2. Wybierz Math Tutor
3. Wpisz pytanie spoza matematyki (np. "Co to jest fotosynteza?")
4. Wyślij
5. Sprawdź czy odpowiedź zawiera informację o tym że to nie jest pytanie z matematyki
6. Sprawdź czy AI sugeruje zadanie pytania o matematykę

**Narzędzia:** Playwright

**Mockowanie:** Brak (test prawdziwego API)

**Oczekiwany rezultat:** ✅ AI uprzejmie odmawia i kieruje do tematu

---

### TEST 8: Brak internetu - offline (Playwright)

**Priorytet:** ŚREDNI\*

**Co testujemy:** Aplikacja obsługuje brak połączenia

**Scenariusz:**

1. Otwórz aplikację w przeglądarce
2. Wybierz Math Tutor i rozpocznij chat
3. Symuluj offline (`page.context().setOffline(true)`)
4. Spróbuj wysłać wiadomość
5. Sprawdź czy:
   - Przycisk jest disabled LUB
   - Wyświetla się komunikat o braku internetu
6. Przywróć internet (`page.context().setOffline(false)`)
7. Sprawdź czy aplikacja działa normalnie

**Narzędzia:** Playwright

**Mockowanie:** Playwright API - `setOffline()`

**Oczekiwany rezultat:** ✅ Komunikat offline i blokada wysyłania

**⚠️ Uwaga:** Ten test zależy od FEATURE 2.1 (Obsługa offline)

---

### TEST 9: Przekroczenie limitu zapytań (Playwright)

**Priorytet:** WYSOKI

**Co testujemy:** Aplikacja kończy sesję po 50 zapytaniach

**Scenariusz:**

1. Otwórz aplikację
2. Wybierz Math Tutor
3. Wyślij 50 wiadomości (pętla)
4. Sprawdź czy po 50. wiadomości:
   - Wyświetla się alert o przekroczeniu limitu
   - Użytkownik jest przekierowany
5. Sprawdź czy historia została zapisana

**Narzędzia:** Playwright

**Mockowanie:** Brak (test prawdziwego flow)

**Oczekiwany rezultat:** ✅ Sesja kończy się po 50 zapytaniach

**⚠️ Uwaga:** Test może być czasochłonny (50 requestów do API)

---

## 📝 Szczegółowy plan wykonania

### FAZA 1: Przygotowanie

**Krok 1.1: Instalacja zależności**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D @playwright/test
npx playwright install
```

**Krok 1.2: Konfiguracja Vitest**

- Stwórz `vitest.config.ts`
- Skonfiguruj environment (jsdom)
- Dodaj setup file dla RTL

**Krok 1.3: Konfiguracja Playwright**

- Stwórz `playwright.config.ts`
- Skonfiguruj baseURL, przeglądarki
- Skonfiguruj folder testów

---

### FAZA 2: Testy jednostkowe - Vitest + RTL

**Priorytet testów:**

1. **WYSOKI** (podstawowe edge cases):
   - TEST 1: Pusta wiadomość
   - TEST 2: Błąd API
   - TEST 3: Walidacja limitu 400 znaków
   - TEST 5: Blokowanie przycisku

2. **ŚREDNI** (dodatkowe zabezpieczenia):
   - TEST 4: Debouncing hook
   - TEST 6: Walidacja imienia
   - TEST 10: Licznik znaków

3. **NISKI** (nice to have):
   - TEST 11: Textarea wieloliniowa

**Kolejność wykonania:**

1. Stwórz `Chat.test.tsx` z TEST 1, 2, 3, 5, 10
2. Stwórz `useDebounce.test.ts` z TEST 4
3. Stwórz `NameInput.test.tsx` z TEST 6
4. Opcjonalnie: dodaj TEST 11

---

### FAZA 3: Testy E2E - Playwright

**Priorytet testów:**

1. **WYSOKI** (krytyczne scenariusze):
   - TEST 7: Pytanie spoza przedmiotu
   - TEST 9: Przekroczenie limitu zapytań ⚠️ czasochłonny

2. **ŚREDNI** (zależny od FEATURE 2.1):
   - TEST 8: Brak internetu - jeśli FEATURE 2.1 jest gotowa

**Kolejność wykonania:**

1. Stwórz `tests/chat-edge-cases.spec.ts` z TEST 7 i TEST 9
2. Jeśli FEATURE 2.1 gotowa: stwórz `tests/offline.spec.ts` z TEST 8

---

### FAZA 4: Dokumentacja i raportowanie

**Krok 4.1: Dokumentacja testów**

- Zaktualizuj `ANALIZA_I_PLAN_WDROZENIA.md`
- Oznacz FEATURE 3.2 jako ukończoną
- Dodaj sekcję z wynikami testów

**Krok 4.2: Skrypty w package.json**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 📊 Podsumowanie testów

### Testy Vitest + RTL (8 testów):

| #   | Nazwa                   | Plik                | Priorytet |
| --- | ----------------------- | ------------------- | --------- |
| 1   | Pusta wiadomość         | Chat.test.tsx       | WYSOKI    |
| 2   | Błąd API                | Chat.test.tsx       | WYSOKI    |
| 3   | Walidacja limitu 400 zn | Chat.test.tsx       | WYSOKI    |
| 4   | Debouncing              | useDebounce.test.ts | ŚREDNI    |
| 5   | Blokowanie przycisku    | Chat.test.tsx       | WYSOKI    |
| 6   | Walidacja imienia       | NameInput.test.tsx  | ŚREDNI    |
| 10  | Licznik znaków          | Chat.test.tsx       | ŚREDNI    |
| 11  | Textarea wieloliniowa   | Chat.test.tsx       | NISKI     |

### Testy Playwright (3 testy):

| #   | Nazwa                    | Plik                    | Priorytet |
| --- | ------------------------ | ----------------------- | --------- |
| 7   | Pytanie spoza przedmiotu | chat-edge-cases.spec.ts | WYSOKI    |
| 8   | Brak internetu           | offline.spec.ts         | ŚREDNI\*  |
| 9   | Limit zapytań            | chat-edge-cases.spec.ts | WYSOKI    |

\*zależny od FEATURE 2.1

---

## ✅ Kryteria akceptacji FEATURE 3.2

### Ukończone (FAZA 1 i 2):

- ✅ Wszystkie 8 edge cases z planu są pokryte testami jednostkowymi
- ✅ Testy jednostkowe przechodzą (`npm run test`) - 13/13 testów ✅
- ✅ Każdy test ma jasny opis i oczekiwany rezultat
- ✅ Mockowanie tylko tam gdzie konieczne (network requests)
- ✅ Konfiguracja Vitest i RTL działa poprawnie
- ✅ TEST 3: Walidacja limitu 400 znaków - zaimplementowane
- ✅ TEST 10: Licznik znaków - zaimplementowane (2 testy)
- ✅ TEST 11: Textarea wieloliniowa - zaimplementowane

### Do ukończenia (FAZA 3 i 4 - E2E):

- ❌ Testy E2E przechodzą (`npm run test:e2e`) - oczekuje na implementację
- ❌ Wyniki są udokumentowane w `ANALIZA_I_PLAN_WDROZENIA.md` - oczekuje na ukończenie FAZY 3

---

## 🎯 Rekomendacje - minimum testów

### ✅ Ukończone testy jednostkowe:

1. ✅ TEST 1: Pusta wiadomość - **Zaimplementowane i przechodzi**
2. ✅ TEST 2: Błąd API - **Zaimplementowane i przechodzi**
3. ✅ TEST 3: Walidacja limitu 400 znaków - **Zaimplementowane i przechodzi**
4. ✅ TEST 4: Debouncing - **Zaimplementowane i przechodzi** (3 testy)
5. ✅ TEST 5: Blokowanie przycisku - **Zaimplementowane i przechodzi**
6. ✅ TEST 6: Walidacja imienia - **Zaimplementowane i przechodzi** (3 testy)
7. ✅ TEST 10: Licznik znaków - **Zaimplementowane i przechodzi** (2 testy)
8. ✅ TEST 11: Textarea wieloliniowa - **Zaimplementowane i przechodzi**

### ⏳ Do zrobienia (testy E2E):

- ❌ TEST 7: Pytanie spoza przedmiotu (Playwright)
- ❌ TEST 8: Brak internetu (Playwright) - zależny od FEATURE 2.1
- ❌ TEST 9: Limit zapytań (Playwright, czasochłonny)

---

## 📚 Powiązane dokumenty

- `ANALIZA_I_PLAN_WDROZENIA.md` - główny plan wdrożenia
- `.cursor/rules/testing.md` - zasady testowania w projekcie
- `package.json` - zależności i skrypty testowe

---

---

## 📊 Status implementacji

**Data utworzenia:** 7 stycznia 2026
**Ostatnia aktualizacja:** 8 stycznia 2026

### ✅ Ukończone fazy:

- ✅ **FAZA 1: Przygotowanie** - Konfiguracja Vitest, RTL i Playwright
- ✅ **FAZA 2: Testy jednostkowe** - Wszystkie 8 testów jednostkowych zaimplementowane i przechodzące

### 📈 Wyniki testów (FAZA 2 - UKOŃCZONA):

**Testy Vitest + RTL:** ✅ 13/13 testów przechodzi (8 przypadków testowych)

| Test                         | Status  | Plik                          |
| ---------------------------- | ------- | ----------------------------- |
| TEST 1: Pusta wiadomość      | ✅ PASS | Chat.test.tsx                 |
| TEST 2: Błąd API             | ✅ PASS | Chat.test.tsx                 |
| TEST 3: Walidacja limitu     | ✅ PASS | Chat.test.tsx                 |
| TEST 4: Debouncing           | ✅ PASS | useDebounce.test.ts (3 testy) |
| TEST 5: Blokowanie przycisku | ✅ PASS | Chat.test.tsx                 |
| TEST 6: Walidacja imienia    | ✅ PASS | NameInput.test.tsx (3 testy)  |
| TEST 10: Licznik znaków      | ✅ PASS | Chat.test.tsx (2 testy)       |
| TEST 11: Textarea            | ✅ PASS | Chat.test.tsx                 |

**Czas wykonania:** ~5.1 sekundy

### ⏳ Do zrobienia:

- ❌ **FAZA 3: Testy E2E** - Playwright (TEST 7, 8, 9)
- ❌ **FAZA 4: Dokumentacja** - Aktualizacja ANALIZA_I_PLAN_WDROZENIA.md

---

**Status:** ✅ FAZA 1 i 2 ukończone, FAZA 3 oczekuje na implementację
