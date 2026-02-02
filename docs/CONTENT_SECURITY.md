# Content Security - Dokumentacja zabezpieczeń



Aplikacja **Korepetytor AI** implementuje wielowarstwowe zabezpieczenia treści podawanych przez użytkownika, chroniąc przed:
- Atakami XSS (Cross-Site Scripting)
- Wulgaryzmami i treściami nieodpowiednimi
- Prompt injection
- Wyciekiem danych osobowych

## Zaimplementowane zabezpieczenia

### 1. Sanityzacja HTML (XSS)

**Metoda:** HTML Escaping (działa na frontend i backend)
**Gdzie używane:**
- Frontend: `Chat.tsx` – przed wysłaniem wiadomości (w `validateAndSanitizeInput()`)
- Backend: `chat.ts` API endpoint – przed przetwarzaniem (ta sama funkcja)
- Agent: `mathTutor/index.ts` – wspólna walidacja przed wywołaniem API Mistral

### 2. Filtr wulgaryzmów

**Lista wykrywanych słów:**
- Podstawowe wulgaryzmy polskie
- Warianty z zastąpionymi literami (np. k*rwa, j*bać)
- Fuzzy matching dla wariantów z liczbami/symbolami (a→@4, e→3, i→1!, o→0)


**Gdzie używane:**
- Frontend: `Chat.tsx` - przed wysłaniem wiadomości
- Frontend: `TutorsForm.tsx` - walidacja formularza
- Backend: `chat.ts` API endpoint - dodatkowa weryfikacja

### 3. Detekcja Prompt Injection

(tylko wiadomości czatu)

### 4. Detekcja danych osobowych

**Wykrywane wzorce:**
- Numery telefonów (format PL: 123-456-789, 123456789)
- Adresy email
- URLe (http://, https://)
- Kody pocztowe (XX-XXX)


## Limity długości

| Pole | Limit | Lokalizacja |
|------|-------|-------------|
| Wiadomość czatu | 400 znaków | `Chat.tsx`, `chat.ts` |
| Opis problemu | 200 znaków | `TutorsForm.tsx` |
| Zainteresowania | 100 znaków | `TutorsForm.tsx` |
| Imię użytkownika | 20 znaków | `NameInput.tsx` |

## Przepływ walidacji

### Frontend (wiadomość czatu):

1. Użytkownik wpisuje wiadomość
2. Kliknięcie "Wyślij" → `Chat.tsx::handleSendInternal()`
3. Walidacja: `validateAndSanitizeInput()`
   - Sprawdzenie długości
   - Sanityzacja HTML
   - Sprawdzenie wulgaryzmów
   - Sprawdzenie prompt injection
   - Sprawdzenie danych osobowych
4. Jeśli niepoprawne → wyświetl błąd
5. Jeśli poprawne → wyślij do API

### Backend (API endpoint):

1. Otrzymanie requestu w `chat.ts`
2. Walidacja podstawowa (pusty string, typ)
3. Walidacja treści: `validateAndSanitizeInput()` z `@/lib/contentFilter` (wspólna funkcja dla całej aplikacji)
   - Te same sprawdzenia jak frontend
4. Jeśli niepoprawne → zwróć 400 Bad Request
5. Jeśli poprawne → przekaż do `mathTutor`
6. Zwróć odpowiedź do frontendu

### Agent (mathTutor):

- Agent używa tej samej funkcji `validateAndSanitizeInput()` z opcjami z `contentRestrictions` (defense in depth).
- Wiadomość przekazana do Mistral API to `validation.sanitized ?? message`.

### Wyświetlanie wiadomości:

1. Otrzymanie wiadomości z API lub z historii (localStorage)
2. `ChatMessages.tsx::MessageBubble` / `HistoryChat.tsx::renderMessage`
3. Treść jest renderowana przez React (`{message.content}`) – React domyślnie escapuje znaki specjalne, co chroni przed XSS
4. Dla wiadomości asystenta używana jest `cleanMathNotation()` (formatowanie notacji matematycznej, np. LaTeX)
5. Brak osobnej funkcji `sanitizeForDisplay()` – bezpieczeństwo zapewnia escapowanie po stronie React oraz sanityzacja przy wysyłaniu (frontend + backend)

## Nagłówki bezpieczeństwa (produkcja)

W pliku `vercel.json` ustawione są nagłówki HTTP (stosowane na Vercel):

- **Content-Security-Policy** – ogranicza źródła skryptów, stylów, fontów, połączeń (XSS, data injection)
- **X-Frame-Options: DENY** – zabezpieczenie przed osadzaniem strony w iframe (clickjacking)
- **X-Content-Type-Options: nosniff** – wyłączenie MIME sniffing
- **Referrer-Policy: strict-origin-when-cross-origin** – ograniczenie danych w nagłówku Referer

## Ważne uwagi

1. **Wspólna walidacja** – jedna funkcja `validateAndSanitizeInput()` z `@/lib/contentFilter` używana w `Chat.tsx`, `chat.ts` API oraz `mathTutor/index.ts`.
2. **Sanityzacja HTML** jest zawsze wykonywana w tej funkcji, niezależnie od opcji.
3. **Frontend, backend i agent** wykonują te same sprawdzenia (defense in depth).
4. **Blacklista wulgaryzmów** może wymagać rozszerzenia w zależności od potrzeb.
5. **Dane osobowe** nie są sprawdzane w polach formularza (zainteresowania, problem).
6. **HTML Escaping** działa identycznie w przeglądarce i Node.js – brak zależności od DOM API.
