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
- Frontend: `ChatMessages.tsx` - wszystkie wiadomości przed wyświetleniem
- Backend: `chat.ts` API endpoint - przed przetwarzaniem

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
3. Walidacja treści: `validateAndSanitizeInput()`
   - Te same sprawdzenia jak frontend
4. Jeśli niepoprawne → zwróć 400 Bad Request
5. Jeśli poprawne → przekaż do `mathTutor`
6. Zwróć odpowiedź do frontendu

### Wyświetlanie wiadomości:

1. Otrzymanie wiadomości z API/historii
2. `ChatMessages.tsx::MessageBubble`
3. Sanityzacja przed wyświetleniem: `sanitizeForDisplay()`
4. Renderowanie bezpiecznej treści

## Ważne uwagi

1. **Sanityzacja HTML** jest zawsze wykonywana, niezależnie od opcji
2. **Frontend i backend** wykonują te same sprawdzenia (defense in depth)
3. **Blacklista wulgaryzmów** może wymagać rozszerzenia w zależności od potrzeb
4. **Dane osobowe** nie są sprawdzane w polach formularza (zainteresowania, problem)
5. **HTML Escaping** działa identycznie w przeglądarce i Node.js - brak zależności od DOM API
