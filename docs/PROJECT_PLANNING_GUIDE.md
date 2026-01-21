# Przewodnik planowania projektów 📋

## Spis treści

- [Jak doświadczeni programiści planują projekty?](#jak-doświadczeni-programiści-planują-projekty)
  - [1. Gdzie tworzą plan?](#1-gdzie-tworzą-plan)
- [2. Jak dzielą projekt na zadania?](#2-jak-dzielą-projekt-na-zadania)
  - [Metoda 1: User Stories (dla aplikacji z użytkownikami)](#metoda-1-user-stories-dla-aplikacji-z-użytkownikami)
  - [Metoda 2: Epiki → Features → Tasks](#metoda-2-epiki-features-tasks)
  - [Metoda 3: Według warstw architektury](#metoda-3-według-warstw-architektury)
- [3. Jak szczegółowy powinien być plan?](#3-jak-szczegółowy-powinien-być-plan)
  - [Poziom 1: Wysoki poziom (dla całego projektu)](#poziom-1-wysoki-poziom-dla-całego-projektu)
  - [Poziom 2: Średni poziom (dla każdego etapu)](#poziom-2-średni-poziom-dla-każdego-etapu)
  - [Poziom 3: Niski poziom (szczegóły implementacji)](#poziom-3-niski-poziom-szczegóły-implementacji)
- [4. Przykładowy plan prostego projektu](#4-przykładowy-plan-prostego-projektu)
  - [Projekt: Aplikacja TODO List](#projekt-aplikacja-todo-list)
  - [ETAP 1: Setup projektu (1-2 godziny)](#etap-1-setup-projektu-1-2-godziny)
  - [ETAP 2: Podstawowa funkcjonalność (2-3 godziny)](#etap-2-podstawowa-funkcjonalność-2-3-godziny)
  - [ETAP 3: Interakcje (1-2 godziny)](#etap-3-interakcje-1-2-godziny)
  - [ETAP 4: Persystencja danych (1 godzina)](#etap-4-persystencja-danych-1-godzina)
  - [ETAP 5: Ulepszenia UI (1-2 godziny)](#etap-5-ulepszenia-ui-1-2-godziny)
  - [Podsumowanie](#podsumowanie)
- [Best Practices planowania](#best-practices-planowania)
  - [✅ DO (Rób to)](#do-rób-to)
  - [❌ DON'T (Nie rób tego)](#dont-nie-rób-tego)
- [Szablony do użycia](#szablony-do-użycia)
  - [Szablon etapu](#szablon-etapu)
  - [Szablon zadania](#szablon-zadania)
- [Narzędzia pomocne w planowaniu](#narzędzia-pomocne-w-planowaniu)

---

## Jak doświadczeni programiści planują projekty?

### 1. Gdzie tworzą plan?

**Opcja A: Dokumentacja w repozytorium**

- `PROJECT.md` - główny plan projektu
- `ROADMAP.md` - długoterminowy plan rozwoju
- `CHANGELOG.md` - historia zmian
- `docs/planning/` - szczegółowe plany etapów

**Opcja B: Systemy zarządzania**

- GitHub Projects / Issues
- Linear, Jira, Trello
- Notion, Obsidian

**Opcja C: Hybrydowe podejście**

- Wysokopoziomowy plan w dokumentacji
- Szczegółowe zadania w Issues
- Notatki techniczne w kodzie

---

## 2. Jak dzielą projekt na zadania?

### Metoda 1: User Stories (dla aplikacji z użytkownikami)

**Co to jest User Story?**

User Story to sposób opisywania funkcjonalności z perspektywy użytkownika. Zamiast myśleć "muszę zrobić formularz", myślisz "uczeń potrzebuje wybrać przedmiot".

**Format:**

```
Jako [kto] chcę [co] żeby [dlaczego]
```

**Dlaczego to działa?**

- **Skupia się na użytkowniku** - nie na technologii
- **Wyjaśnia cel** - wiesz dlaczego coś robisz
- **Łatwo priorytetyzować** - ważniejsze dla użytkownika = wyższy priorytet

**Przykłady z projektu Chat-with-Hero:**

```
✅ DOBRE User Stories:

1. Jako uczeń chcę wybrać przedmiot (matematyka, angielski)
   żeby rozpocząć naukę z odpowiednim korepetytorem

2. Jako uczeń chcę zadać pytanie AI w języku naturalnym
   żeby otrzymać pomoc bez stresu

3. Jako uczeń chcę zobaczyć historię moich rozmów
   żeby wrócić do poprzednich wyjaśnień

4. Jako uczeń chcę podać swoje zainteresowania
   żeby AI używało przykładów które rozumiem (np. gry, sport)

5. Jako uczeń chcę widzieć że AI "myśli" (loading state)
   żeby wiedzieć że moja wiadomość została wysłana
```

**Jak przekształcić User Story na zadania?**

Każda User Story dzieli się na konkretne zadania techniczne:

```
User Story: "Jako uczeń chcę wybrać przedmiot żeby rozpocząć naukę"

Zadania:
- [ ] Stwórz komponent TutorsForm.tsx
- [ ] Dodaj routing do /tutors
- [ ] Zapisz wybór w localStorage
- [ ] Przekieruj do /chat po wyborze
- [ ] Dodaj walidację (musi wybrać przedmiot)
```

**Akceptacja (Definition of Done):**

Każda User Story powinna mieć kryteria akceptacji:

```
User Story: "Jako uczeń chcę zadać pytanie AI żeby otrzymać pomoc"

Kryteria akceptacji:
✅ Mogę wpisać pytanie w pole tekstowe
✅ Po kliknięciu "Wyślij" moja wiadomość pojawia się w czacie
✅ Widzę że AI "myśli" (loading indicator)
✅ Po chwili otrzymuję odpowiedź od AI
✅ Odpowiedź jest związana z wybranym przedmiotem
✅ Mogę zadać kolejne pytanie
```

**Kiedy używać User Stories?**

- ✅ Aplikacje z użytkownikami końcowymi
- ✅ Gdy chcesz skupić się na potrzebach użytkownika
- ✅ W zespole gdzie nie wszyscy są techniczni
- ✅ Gdy priorytetyzujesz funkcjonalności

**Kiedy NIE używać?**

- ❌ Projekty bez użytkowników (np. biblioteki, narzędzia dev)
- ❌ Gdy pracujesz sam i znasz wszystkie potrzeby
- ❌ Bardzo techniczne zadania (np. "zoptymalizuj bazę danych")

---

### Metoda 2: Epiki → Features → Tasks

**Co to jest hierarchiczna struktura?**

To sposób organizacji zadań od dużych celów (Epiki) przez funkcjonalności (Features) do konkretnych zadań (Tasks). Jak rosyjskie matrioszki - duże zawiera mniejsze.

**Trzy poziomy:**

1. **EPIK** - duży cel biznesowy (np. "System czatu z AI")
2. **FEATURE** - konkretna funkcjonalność (np. "Wybór przedmiotu")
3. **TASK** - małe, wykonalne zadanie (np. "Stwórz komponent TutorsForm")

**Przykład z projektu Chat-with-Hero:**

```
EPIK: System czatu z AI
  │
  │ (Cel: Umożliwić uczniom rozmowę z AI korepetytorem)
  │
  ├── FEATURE: Wybór przedmiotu
  │   │ (Funkcjonalność: Uczeń wybiera przedmiot przed rozpoczęciem)
  │   │
  │   ├── Task: Stwórz komponent TutorsForm.tsx
  │   │   (Szacowany czas: 2 godziny)
  │   │
  │   ├── Task: Dodaj routing do /tutors
  │   │   (Szacowany czas: 30 minut)
  │   │
  │   ├── Task: Zapisz wybór w localStorage
  │   │   (Szacowany czas: 1 godzina)
  │   │
  │   └── Task: Przekieruj do /chat po wyborze
  │       (Szacowany czas: 30 minut)
  │
  ├── FEATURE: Interaktywny chat
  │   │ (Funkcjonalność: Uczeń rozmawia z AI)
  │   │
  │   ├── Task: Stwórz endpoint /api/chat.ts
  │   │   (Szacowany czas: 3 godziny)
  │   │
  │   ├── Task: Zintegruj Mistral API
  │   │   (Szacowany czas: 2 godziny)
  │   │
  │   ├── Task: Zaktualizuj UI Chat.tsx
  │   │   (Szacowany czas: 2 godziny)
  │   │
  │   └── Task: Dodaj loading i error states
  │       (Szacowany czas: 1 godzina)
  │
  └── FEATURE: Historia rozmów
      │ (Funkcjonalność: Uczeń widzi poprzednie rozmowy)
      │
      ├── Task: Zapisz historię w localStorage
      │   (Szacowany czas: 1 godzina)
      │
      ├── Task: Stwórz stronę /history
      │   (Szacowany czas: 2 godziny)
      │
      └── Task: Wyświetl listę poprzednich rozmów
          (Szacowany czas: 1 godzina)
```

**Jak to działa w praktyce?**

**Krok 1: Zdefiniuj EPIKI**

Epik to duży cel, który może trwać tygodnie lub miesiące:

```
EPIK 1: System czatu z AI
EPIK 2: System personalizacji (zainteresowania, poziom)
EPIK 3: Panel rodzica/nauczyciela
EPIK 4: Integracja z bazą danych
```

**Krok 2: Podziel EPIK na FEATURES**

Feature to funkcjonalność którą użytkownik widzi i używa:

```
EPIK: System czatu z AI
  ├── FEATURE: Wybór przedmiotu
  ├── FEATURE: Interaktywny chat
  ├── FEATURE: Historia rozmów
  └── FEATURE: Eksport historii (PDF)
```

**Krok 3: Podziel FEATURE na TASKS**

Task to małe zadanie wykonalne w 1-4 godziny:

```
FEATURE: Interaktywny chat
  ├── Task: Stwórz endpoint /api/chat.ts
  ├── Task: Zintegruj Mistral API
  ├── Task: Zaktualizuj UI Chat.tsx
  └── Task: Dodaj loading i error states
```

**Zasady dobrego podziału:**

✅ **EPIK** - duży cel (tygodnie/miesiące pracy)

✅ **FEATURE** - funkcjonalność widoczna dla użytkownika (dni/tygodnie)

✅ **TASK** - małe zadanie (1-4 godziny)

❌ **NIE** - Task nie powinien trwać dłużej niż 1 dzień

❌ **NIE** - Feature nie powinien być większy niż 1 tydzień

❌ **NIE** - Epik nie powinien być większy niż 1-2 miesiące

**Przykład pełnej struktury dla projektu Chat-with-Hero:**

```
📦 PROJEKT: Chat-with-Hero (Tutor with AI)

🎯 EPIK 1: System czatu z AI
   ├── 📱 FEATURE: Wybór przedmiotu
   │   ├── ✅ Task: Stwórz TutorsForm.tsx
   │   ├── ✅ Task: Routing /tutors
   │   └── ✅ Task: localStorage
   │
   ├── 💬 FEATURE: Interaktywny chat
   │   ├── ✅ Task: Endpoint /api/chat
   │   ├── ✅ Task: Integracja Mistral
   │   └── ✅ Task: UI Chat.tsx
   │
   └── 📚 FEATURE: Historia rozmów
       ├── ✅ Task: Zapisz w localStorage
       └── ✅ Task: Strona /history

🎯 EPIK 2: Personalizacja odpowiedzi
   ├── 🎨 FEATURE: Zbieranie zainteresowań
   │   ├── ⏳ Task: Formularz zainteresowań
   │   └── ⏳ Task: Zapisz w localStorage
   │
   └── 🧠 FEATURE: Dostosowanie promptów
       ├── ⏳ Task: Modyfikacja prompts.ts
       └── ⏳ Task: Testy personalizacji

🎯 EPIK 3: Integracja z bazą danych
   ├── 🗄️ FEATURE: Setup Supabase
   │   └── ⏳ Task: Konfiguracja klienta
   │
   └── 💾 FEATURE: Zapisywanie historii
       ├── ⏳ Task: Tabela conversations
       └── ⏳ Task: API do zapisu/odczytu
```

**Kiedy używać hierarchicznej struktury?**

- ✅ Duże projekty (więcej niż 1-2 tygodnie)
- ✅ Gdy pracujesz w zespole
- ✅ Gdy chcesz śledzić postęp na różnych poziomach
- ✅ Gdy masz wiele powiązanych funkcjonalności

**Kiedy NIE używać?**

- ❌ Bardzo małe projekty (1-2 dni)
- ❌ Gdy pracujesz sam i wszystko masz w głowie
- ❌ Proste aplikacje bez wielu funkcjonalności

**Jak śledzić postęp?**

Możesz używać checkboxów na każdym poziomie:

```
EPIK: System czatu z AI [████████░░] 80%
  ├── FEATURE: Wybór przedmiotu [██████████] 100% ✅
  ├── FEATURE: Interaktywny chat [██████████] 100% ✅
  └── FEATURE: Historia rozmów [████░░░░░░] 50% ⏳
```

**Porównanie z User Stories:**

| Aspekt        | User Stories         | Epiki → Features → Tasks     |
| ------------- | -------------------- | ---------------------------- |
| **Skupienie** | Na użytkowniku       | Na funkcjonalnościach        |
| **Język**     | "Jako uczeń chcę..." | "FEATURE: Wybór przedmiotu"  |
| **Struktura** | Płaska lista         | Hierarchiczna (3 poziomy)    |
| **Dla kogo**  | Product Owner, UX    | Zespół techniczny            |
| **Kiedy**     | Planowanie MVP       | Organizacja dużych projektów |

**Możesz łączyć obie metody!**

```
EPIK: System czatu z AI
  └── FEATURE: Interaktywny chat
      ├── User Story: "Jako uczeń chcę zadać pytanie AI żeby otrzymać pomoc"
      │   ├── Task: Stwórz endpoint /api/chat
      │   ├── Task: Zintegruj Mistral API
      │   └── Task: Zaktualizuj UI Chat.tsx
      │
      └── User Story: "Jako uczeń chcę widzieć że AI myśli żeby wiedzieć że działa"
          └── Task: Dodaj loading state
```

### Metoda 3: Według warstw architektury

```
BACKEND:
- [ ] Stwórz API endpoint /api/chat
- [ ] Zintegruj Mistral AI
- [ ] Dodaj walidację danych

FRONTEND:
- [ ] Komponent wyboru przedmiotu
- [ ] Komponent czatu
- [ ] Strona historii

INFRASTRUKTURA:
- [ ] Konfiguracja zmiennych środowiskowych
- [ ] Setup CI/CD
- [ ] Deployment
```

---

## 3. Jak szczegółowy powinien być plan?

### Poziom 1: Wysoki poziom (dla całego projektu)

```markdown
## Cel projektu

Aplikacja edukacyjna z AI korepetytorem dla nastolatków

## Główne etapy

1. Setup projektu i konfiguracja
2. Integracja z Mistral AI
3. Frontend - interfejs użytkownika
4. Testowanie i optymalizacja
```

### Poziom 2: Średni poziom (dla każdego etapu)

```markdown
## ETAP 2: Integracja z Mistral AI

### Krok 2.1 - Przygotowanie

- Załóż konto Mistral
- Zdobądź API key
- Dodaj do .env

### Krok 2.2 - Struktura agentów

- Stwórz folder src/agents/
- Stwórz mathTutor/ z plikami:
  - config.ts
  - prompts.ts
  - index.ts
  - types.ts

### Krok 2.3 - API endpoint

- Stwórz src/pages/api/chat.ts
- Zaimplementuj wywołanie Mistral
- Dodaj walidację
```

### Poziom 3: Niski poziom (szczegóły implementacji)

```typescript
// To już w kodzie, nie w planie!

// config.ts
export const mathTutorConfig = {
  model: "mistral-small",
  temperature: 0.7,
  maxTokens: 500,
};

// prompts.ts
export const systemPrompt = `Jesteś korepetytorem matematyki...`;
```

**Zasada:** Plan powinien być na poziomie 2 (średnim). Szczegóły implementacji są w kodzie.

---

## 4. Przykładowy plan prostego projektu

### Projekt: Aplikacja TODO List

#### Cel projektu

Prosta aplikacja do zarządzania zadaniami z możliwością dodawania, edytowania i usuwania.

---

### ETAP 1: Setup projektu (1-2 godziny)

**Cel:** Przygotowanie środowiska i struktury projektu

#### Krok 1.1 - Inicjalizacja

- [ ] Stwórz nowy projekt (np. `npm create astro@latest`)
- [ ] Zainstaluj zależności
- [ ] Sprawdź czy projekt się uruchamia

#### Krok 1.2 - Struktura folderów

- [ ] Stwórz `src/components/TodoList.tsx`
- [ ] Stwórz `src/components/TodoItem.tsx`
- [ ] Stwórz `src/pages/index.astro`

#### Krok 1.3 - Stylowanie

- [ ] Skonfiguruj Tailwind CSS
- [ ] Dodaj podstawowe style globalne

**Kryteria ukończenia:**

- Projekt się uruchamia bez błędów
- Widzę pustą stronę główną

---

### ETAP 2: Podstawowa funkcjonalność (2-3 godziny)

**Cel:** Możliwość dodawania i wyświetlania zadań

#### Krok 2.1 - Stan aplikacji

- [ ] Dodaj useState dla listy zadań
- [ ] Stwórz typ TypeScript dla zadania
  ```typescript
  type Todo = {
    id: string;
    text: string;
    completed: boolean;
  };
  ```

#### Krok 2.2 - Komponent TodoList

- [ ] Wyświetl listę zadań (mapowanie)
- [ ] Dodaj placeholder gdy lista pusta
- [ ] Styluj listę (Tailwind)

#### Krok 2.3 - Formularz dodawania

- [ ] Input do wpisywania zadania
- [ ] Przycisk "Dodaj"
- [ ] Funkcja dodawania do listy
- [ ] Walidacja (nie można dodać pustego)

**Kryteria ukończenia:**

- Mogę dodać zadanie
- Widzę listę zadań
- Puste zadania są blokowane

---

### ETAP 3: Interakcje (1-2 godziny)

**Cel:** Oznaczanie jako wykonane i usuwanie

#### Krok 3.1 - Oznaczanie jako wykonane

- [ ] Dodaj checkbox do każdego zadania
- [ ] Funkcja toggle (zmiana completed)
- [ ] Wizualne oznaczenie wykonanych (przekreślenie)

#### Krok 3.2 - Usuwanie zadań

- [ ] Przycisk "Usuń" przy każdym zadaniu
- [ ] Funkcja usuwania z listy
- [ ] Potwierdzenie przed usunięciem (opcjonalnie)

**Kryteria ukończenia:**

- Mogę oznaczyć zadanie jako wykonane
- Mogę usunąć zadanie
- UI jest responsywne

---

### ETAP 4: Persystencja danych (1 godzina)

**Cel:** Zapisywanie zadań w localStorage

#### Krok 4.1 - Zapisywanie

- [ ] useEffect do zapisu przy każdej zmianie
- [ ] JSON.stringify do localStorage

#### Krok 4.2 - Ładowanie

- [ ] useEffect do wczytania przy starcie
- [ ] JSON.parse z localStorage
- [ ] Obsługa pustego localStorage

**Kryteria ukończenia:**

- Zadania są zapisywane automatycznie
- Po odświeżeniu strony zadania pozostają

---

### ETAP 5: Ulepszenia UI (1-2 godziny)

**Cel:** Lepsze doświadczenie użytkownika

#### Krok 5.1 - Animacje

- [ ] Animacja pojawiania się nowych zadań
- [ ] Animacja usuwania zadań
- [ ] Smooth transitions

#### Krok 5.2 - Statystyki

- [ ] Licznik wszystkich zadań
- [ ] Licznik wykonanych zadań
- [ ] Procent ukończenia

**Kryteria ukończenia:**

- Aplikacja wygląda profesjonalnie
- Animacje są płynne
- Statystyki są widoczne

---

### Podsumowanie

**Czas całkowity:** ~6-10 godzin
**Poziom trudności:** Początkujący
**Technologie:** React, TypeScript, Tailwind CSS

**Struktura zadań:**

- 5 głównych etapów
- 12 konkretnych kroków
- Każdy krok ma jasne kryteria ukończenia

---

## Best Practices planowania

### ✅ DO (Rób to)

1. **Zacznij od celu** - zawsze określ co chcesz osiągnąć
2. **Dziel na małe kroki** - każdy krok powinien być wykonalny w 1-3 godziny
3. **Określ kryteria ukończenia** - jak będziesz wiedział że krok jest gotowy?
4. **Używaj checkboxów** - łatwo śledzić postęp
5. **Aktualizuj plan** - gdy coś się zmienia, zaktualizuj plan
6. **Dodawaj notatki** - zapisuj co się nauczyłeś, co było trudne

### ❌ DON'T (Nie rób tego)

1. **Zbyt szczegółowo** - nie planuj każdej linijki kodu
2. **Zbyt ogólnie** - "Zrób aplikację" to za mało
3. **Zapominaj o testach** - zawsze uwzględnij testowanie
4. **Ignoruj błędy** - jeśli coś nie działa, zaktualizuj plan
5. **Planuj za daleko** - planuj 1-2 tygodnie do przodu, nie miesiące

---

## Szablony do użycia

### Szablon etapu

```markdown
## ETAP X: [Nazwa etapu]

**Cel:** [Co chcesz osiągnąć w tym etapie]

#### Krok X.1 - [Nazwa kroku]

- [ ] Zadanie 1
- [ ] Zadanie 2
- [ ] Zadanie 3

**Kryteria ukończenia:**

- [Jak sprawdzisz że etap jest gotowy]
```

### Szablon zadania

```markdown
### [Nazwa zadania]

**Opis:** [Co dokładnie trzeba zrobić]

**Pliki do utworzenia/modyfikacji:**

- `src/components/X.tsx`
- `src/pages/Y.astro`

**Zależności:**

- Wymaga ukończenia zadania Z

**Szacowany czas:** [np. 1 godzina]
```

---

## Narzędzia pomocne w planowaniu

1. **Markdown** - prosty, czytelny, wersjonowany w Git
2. **GitHub Issues** - dla większych projektów
3. **GitHub Projects** - wizualne zarządzanie zadaniami
4. **Linear** - profesjonalne narzędzie dla zespołów
5. **Notion** - dla dokumentacji i planów

---

**Pamiętaj:** Plan to żywy dokument. Aktualizuj go w miarę postępów! 🚀
