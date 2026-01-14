# Plan integracji z Mistral AI 🎯

Data utworzenia: 8 grudnia 2025
Projekt: Chat-with-Hero (Tutor with AI)

---

## Cel projektu

Połączenie aplikacji edukacyjnej z AI Mistral w celu stworzenia interaktywnego korepetytora, który pomoże nastolatkom w nauce poprzez personalizowane rozmowy dostosowane do ich zainteresowań i poziomu wiedzy.

---

# Tech stack

Frontend (PWA-ready, prosty w utrzymaniu):

- Astro
- React + TypeScript
- React Query
- Redux Toolkit
- PWA Service Worker + Workbox

 
Backend (najbardziej praktyczny i najtańszy):

- Node.js + Supabase
- Serverless (Vercel)

Baza danych:

- Supabase (Postgres + Auth + Storage) – bardzo praktyczne. Plan Free + ping (np. GH Actions) co 4 dni żeby nie pauzować projektu!

## ETAP 1: Przygotowanie i konfiguracja

### Krok 1.1 - Załóż konto i zdobądź API key

- Załóż konto na platformie Mistral AI (mistral.ai)
- Wygeneruj klucz API w panelu deweloperskim
- Zapisz klucz w bezpiecznym miejscu

### Krok 1.2 - Zainstaluj niezbędną bibliotekę

- Dodaj oficjalną bibliotekę klienta Mistral do projektu
- Możesz użyć `@mistralai/mistralai` lub po prostu `fetch` API
- Dodaj paczkę do `package.json`

### Krok 1.3 - Zabezpiecz klucz API

- Stwórz plik `.env` w głównym katalogu projektu
- Dodaj klucz API do zmiennych środowiskowych
- Upewnij się, że `.env` jest w `.gitignore`
- Format: `MISTRAL_API_KEY=your_api_key_here`

---

## ETAP 2: Struktura agentów (zgodnie z zasadami projektu)

### Krok 2.1 - Stwórz folder dla agentów

- Utwórz folder `src/agents/` (zgodnie z zasadami projektu)
- To będzie miejsce na wszystkich korepetytorów
- Struktura: `src/agents/[przedmiot]Tutor/`

### Krok 2.2 - Przygotuj strukturę pierwszego agenta (np. matematyka)

- Stwórz folder `src/agents/mathTutor/`
- W środku będą pliki:
  - `config.ts` - konfiguracja agenta
  - `prompts.ts` - prompty systemowe
  - `index.ts` - główna logika
  - `types.ts` - typy TypeScript

### Krok 2.3 - Zaprojektuj konfigurację agenta

#### `config.ts`

- Osobowość agenta (przyjazny, cierpliwy nauczyciel)
- Ograniczenia (tylko matematyka, bezpieczne treści)
- Model AI (np. `mistral-small`, `mistral-medium`)
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

---

## ETAP 3: Backend - API endpoint

### Krok 3.1 - Stwórz folder dla API

- W `src/pages/api/` dodaj nowy plik dla chatu
- Nazwa: `src/pages/api/chat.ts` lub `chat.json.ts`
- Format: Astro API endpoint

### Krok 3.2 - Zaprojektuj endpoint do rozmowy

#### Request (co przyjmuje):

- Wiadomość użytkownika (message: string)
- Historia czatu (history: Message[])
- Dane studenta (studentData: StudentData)
- ID agenta/przedmiotu (subject: string)

#### Response (co zwraca):

- Odpowiedź AI (response: string)
- Status (success: boolean)
- Błąd (error?: string)
- Metadata (tokeny, czas odpowiedzi)

### Krok 3.3 - Zaimplementuj logikę wywołania Mistral

1. Walidacja danych wejściowych
2. Pobranie odpowiedniego agenta (np. mathTutor)
3. Przygotowanie kontekstu:
   - Prompt systemowy z `prompts.ts`
   - Dane studenta (zainteresowania, poziom)
   - Historia konwersacji (ostatnie N wiadomości)
4. Wywołanie Mistral API
5. Przetworzenie odpowiedzi
6. Zwrócenie wyniku do frontendu

**Bezpieczeństwo:**

- Sprawdzenie czy pytanie jest związane z przedmiotem
- Filtrowanie niewłaściwych treści
- Rate limiting (ograniczenie liczby zapytań)

---

## ETAP 4: Frontend - Interaktywny chat

### Krok 4.1 - Dodaj stan w komponencie Chat.tsx

```typescript
// Stan do dodania:
const [messages, setMessages] = useState<Message[]>([]);
const [inputValue, setInputValue] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Krok 4.2 - Stwórz funkcję wysyłania wiadomości

1. Pobierz dane studenta z localStorage
2. Dodaj wiadomość użytkownika do listy
3. Wyślij request do `/api/chat`
4. Pokaż loading state
5. Odbierz odpowiedź AI
6. Dodaj odpowiedź do listy wiadomości
7. Obsłuż błędy

### Krok 4.3 - Zaktualizuj UI do wyświetlania prawdziwej konwersacji

- Zastąp statyczne przykłady dynamiczną listą `messages.map()`
- Rozróżnij wizualnie: wiadomości użytkownika vs AI
- Dodaj auto-scroll do ostatniej wiadomości
- Pokaż timestamp dla każdej wiadomości (opcjonalnie)

### Krok 4.4 - Dodaj obsługę stanów ładowania

**Loading state:**

- Pokaż "AI pisze..." lub animację kropek
- Zablokuj przycisk "Send" podczas ładowania
- Zablokuj input podczas ładowania

**Error state:**

- Wyświetl przyjazny komunikat błędu
- Pozwól na ponowienie próby
- Loguj błędy do console

**Empty state:**

- Powitalna wiadomość od AI
- Sugestie pierwszych pytań
- Krótki opis jak działa korepetytor

---

## ETAP 5: Personalizacja i bezpieczeństwo

### Krok 5.1 - Wykorzystaj dane studenta

Dane z localStorage (z poprzedniego kroku):

- `studentData.subject` - wybrany przedmiot
- `studentData.problem` - konkretne problemy
- `studentData.interests` - zainteresowania

**Wykorzystanie:**

- Dostosuj prompt systemowy do przedmiotu
- Użyj zainteresowań w przykładach
- Personalizuj poziom trudności

### Krok 5.2 - Dodaj ograniczenia bezpieczeństwa

**W prompcie systemowym:**

- Tylko odpowiedzi związane z przedmiotem
- Bezpieczne treści dla nastolatków (13-19 lat)
- Brak kontrowersyjnych tematów
- Edukacyjny, wspierający ton

**W kodzie:**

- Filtrowanie niewłaściwych słów kluczowych
- Walidacja długości wiadomości
- Limit historii (np. ostatnie 20 wiadomości)
- Timeout dla zapytań (np. 30 sekund)

### Krok 5.3 - Implementuj timer sesji

- Wykorzystaj istniejący pasek postępu w `Chat.tsx`
- Ustaw limit czasu sesji (np. 30 minut)
- Lub limit wiadomości (np. 50 pytań)
- Po przekroczeniu: komunikat + przekierowanie do głównej strony
- Zapisz historię do localStorage przed zakończeniem

---

## ETAP 6: Testowanie i optymalizacja

### Krok 6.1 - Przetestuj podstawowy flow

**Scenariusze testowe:**

1. Użytkownik zadaje proste pytanie → otrzymuje odpowiedź
2. Kontynuacja rozmowy → AI pamięta kontekst
3. Pytanie z użyciem zainteresowań → spersonalizowana odpowiedź
4. Długa konwersacja → historia działa poprawnie

### Krok 6.2 - Przetestuj edge cases

**Problemy do sprawdzenia:**

- Pytanie spoza przedmiotu → AI uprzejmie odmawia
- Błąd API → przyjazny komunikat dla użytkownika
- Brak internetu → obsługa offline
- Bardzo długie pytanie → obcięcie lub walidacja
- Pusta wiadomość → blokada wysyłki
- Szybkie klikanie "Send" → debouncing

### Krok 6.3 - Optymalizuj koszty

**Strategie oszczędzania:**

- Ogranicz historię do ostatnich 10-15 wiadomości
- Użyj `mistral-small` dla prostych pytań
- `mistral-medium` tylko dla złożonych obliczeń
- Skróć prompt systemowy (mniej tokenów)
- Cache dla identycznych pytań (opcjonalnie)
- Monitoruj użycie API w dashboard Mistral

---

## ETAP 7: Progressive Web App (PWA)

### Krok 7.1 - Zainstaluj integrację PWA

- Użyj `@vite-pwa/astro` - automatyzuje konfigurację
- Dodaj do `astro.config.mjs`
- Konfiguruj Service Worker z Workbox

### Krok 7.2 - Utwórz Web App Manifest

**W `public/manifest.json`:**

- Nazwa aplikacji i opis
- Ikony (192x192, 512x512)
- Kolory (theme_color, background_color)
- Display mode (standalone)
- Start URL

### Krok 7.3 - Dodaj ikony aplikacji

- Wygeneruj ikony w różnych rozmiarach
- Umieść w `public/icons/`
- Dodaj do manifestu
- Favicon i Apple Touch Icon

### Krok 7.4 - Skonfiguruj cache strategy

**Service Worker:**

- Cache statyczne zasoby (CSS, JS, obrazy)
- Network-first dla API (/api/chat)
- Cache-first dla assets
- Offline fallback page

### Krok 7.5 - Dodaj obsługę offline

- Wykryj stan offline
- Pokaż komunikat użytkownikowi
- Queue wiadomości do wysłania
- Sync po powrocie online (opcjonalnie)

### Krok 7.6 - Testuj PWA

- Lighthouse audit (min. 90 punktów)
- Testuj instalację na mobile
- Sprawdź cache offline
- Weryfikuj manifest i Service Worker

---

## Kolejność wykonania (krok po kroku)

### Faza przygotowawcza

- [x] 1. Załóż konto Mistral i zdobądź API key
- [x] 2. Zainstaluj bibliotekę + dodaj `.env`
- [x] 3. Dodaj `.env` do `.gitignore`

### Faza struktury

- [x] 4. Stwórz folder `src/agents/`
- [x] 5. Stwórz `src/agents/mathTutor/` z plikami
- [x] 6. Napisz `config.ts` i `prompts.ts`
- [x] 7. Napisz `types.ts` i `index.ts`

### Faza backend

- [x] 8. Stwórz `src/pages/api/chat.ts`
- [x] 9. Zaimplementuj wywołanie Mistral API
- [x] 10. Dodaj walidację i bezpieczeństwo

### Faza frontend

- [x] 11. Zaktualizuj `Chat.tsx` (dodaj stan)
- [x] 12. Zaimplementuj funkcję wysyłania wiadomości
- [x] 13. Zaktualizuj UI do dynamicznych wiadomości
- [x] 14. Dodaj loading/error states

### Faza personalizacji

- [x] 15. Dołącz dane studenta do zapytań
- [x] 17. Dodaj zapisywanie historii

### Faza testów

- [ ] 18. Testuj podstawowy flow
- [ ] 19. Testuj edge cases
- [ ] 20. Optymalizuj koszty i wydajność

### Faza PWA (opcjonalnie)

- [ ] 21. Zainstaluj `@vite-pwa/astro`
- [ ] 22. Stwórz manifest.json i dodaj ikony
- [ ] 23. Skonfiguruj Service Worker i cache
- [ ] 24. Dodaj obsługę offline
- [ ] 25. Testuj z Lighthouse (cel: 90+ punktów)

---

## Najważniejsze zasady

- **Małe kroki** - każdy krok to osobna, mała zmiana
- **Testowanie** - testuj po każdym kroku
- **Jeden agent** - zacznij od matematyki, później powiel strukturę
- **Bezpieczeństwo** - zawsze waliduj dane wejściowe
- **Koszty** - monitoruj użycie API
- **UX** - wszystkie stany muszą być obsłużone (loading, error, empty)

---

## Przydatne linki

- [Astro API Endpoints](https://docs.astro.build/en/core-concepts/endpoints/)

---

## Notatki

- Model: Zacznij od `mistral-small` (tańszy, szybszy)
- Temperatura: 0.7 (dobra równowaga kreatywność/precyzja)
- Max tokens: 500-1000 (krótkie, zwięzłe odpowiedzi)
- Język: Polski (dla nastolatków w Polsce)

---

## Następne kroki po MVP

1. **PWA** - dodaj obsługę offline i instalację (ETAP 7)
2. Dodaj więcej agentów (chemTutor, physicsTutor, etc.)
3. Zapisywanie historii w bazie danych (Supabase)
4. Push notifications dla przypomnień o nauce

---

**Status:** ✅ MVP ukończone! (14/20 kroków wykonane - wszystkie kluczowe funkcje działają)
**Następny krok:** Testy E2E (kroki 18-20) lub implementacja PWA (kroki 21-25)
