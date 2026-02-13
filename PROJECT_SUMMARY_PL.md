# Podsumowanie projektu – co wynieść jako junior frontend developer

### Zachować wszystkie rules do następnego projektu!

### <span style="color: green;">CO SIĘ UDAŁO:</span>

- poznać Astro 👍
- poznać PWA 👍
- Vitest i React Testing Library
- Testy jednostkowe, niezbędne
- wykorzystać szablon od 10xDevs
- stosować więcej dopasowanych rules, skills, commands

### <span style="color: red;">CO SIĘ NIE UDAŁO:</span>

- Supabase (Postgres + Auth + Storage): nie było sensu, za mały projekt
- Uwierzytelnianie: nie było sensu, za mały projekt
- React Query: nie było sensu, za mały projekt
- Redux Toolkit: nie było sensu, za mały projekt
- Playwright: jest już Vitest i React Testing Library

---

### Czy asChild jest potrzebne?

asChild pozwala renderować Button jako inny element, zachowując jego style. To przydatne, gdy potrzebujesz linka wyglądającego jak przycisk.

Tak, jeśli chcesz:

- Link wyglądający jak przycisk (lepsze SEO i dostępność)
- Przycisk jako inny komponent (np. Link z React Router)
- Zachować style Button, ale użyć innego elementu HTML

Jeśli zawsze używasz zwykłego `<button>`, możesz usunąć asChild, ale lepiej go zostawić — to standardowy wzorzec w Shadcn/ui i przydaje się w wielu sytuacjach.

<details>
<summary>Odnośnik tylko przekierowujący na inną stronę ze stylami z Button (kliknij, aby rozwinąć)</summary>

```html
<a href="/" class="inline-block">
  <button variant="back">Koniec na dziś</button>
</a>
```

Bez **asChild** (normalny przycisk)

```html
<button>Kliknij mnie</button>
<!-- Renderuje: <button className="...">Kliknij mnie</button> -->
```

Z asChild (przycisk jako link):

```html
<button asChild>
  <a href="/strona">Kliknij mnie</a>
</button>
<!-- Renderuje: <a href="/strona" className="...">Kliknij mnie</a> -->
```

</details>

---

### Kiedy **cva i cn** są przydatne:

- Gdy masz wiele wariantów i kombinacji (np. size + variant + color)
- Gdy chcesz dynamicznie łączyć klasy z props

---

## 1. Stack i narzędzia

- **Astro + React** – Astro do stron i routingu, React tylko tam, gdzie potrzebna jest interakcja (np. chat). Mniej JS, szybsze ładowanie.

## 2. Struktura projektu

- **Stała struktura katalogów** – `pages/`, `components/`, `lib/`, `pages/api/`, `layouts/`, `assets/`. Nowe pliki w odpowiednich miejscach.
- **Importy z aliasem** – `@/components`, `@/lib` zamiast długich `../../../`.
- **Podział odpowiedzialności** – komponenty UI vs logika (hooks), API w `pages/api/`, wspólna logika w `lib/`.

## 3. React – wzorce z tego repo

- **Custom hooki** – `useOnline`, `useSessionTimer`, `useInitialGreeting`. Logika wyciągnięta z komponentów.
- **Kompozycja** – `Chat` składa się z `ChatHeader`, `ChatMessages`, `ChatInput`, `ChatStats`. Mniejsze komponenty = łatwiejsze testy.
- **Stan** – `useState` do UI i danych, `useRef` do rzeczy bez przerenderowania (timeouty, refy do DOM).

## 4. API i backend

- **Endpoint jako plik** – `src/pages/api/chat.ts` eksportuje `POST`; Astro/Vercel traktuje to jako API route.
- **Spójne odpowiedzi** – `jsonResponse`, `errorResponse` – jeden format (np. `{ success, error }`).

## 5. PWA – najważniejsze informacje do zapamiętania

### Trzy filary PWA

- **Manifest** – plik JSON (np. `manifest.webmanifest`) z metadanymi: nazwa, krótka nazwa, ikony (192×192, 512×512), `theme_color`, `background_color`, `display: "standalone"`. Przeglądarka wie, jak wyświetlić i zainstalować aplikację.
- **Service Worker** – skrypt działający w tle, niezależny od strony. Rejestrujesz go raz (`navigator.serviceWorker.register("/sw.js")`). Odpowiada za **cache** (offline) i ewentualnie push notifications.
- **HTTPS** – service worker działa tylko przez bezpieczne połączenie (lub localhost).

### W tym projekcie

- **Rejestracja SW** – ręczna w `Layout.astro` (production only): `navigator.serviceWorker.register("/sw.js", { scope: "/" })`. W dev PWA wyłączone, żeby uniknąć problemów z nawigacją.
- **Przycisk instalacji** – `PwaInstallButton`: nasłuchuje `beforeinstallprompt`, zapisuje event, pokazuje przycisk „Zainstaluj”; po `prompt()` i `userChoice` zapisuje w `localStorage`, żeby nie pokazywać ponownie. Sprawdza `display-mode: standalone`, żeby nie pokazywać przycisku, gdy app jest już zainstalowana.

### Kluczowe pojęcia PWA do zapamiętania

- **beforeinstallprompt** – event (Chrome/Edge) gdy app spełnia kryteria instalacji; trzeba go przechwycić i wywołać `prompt()` na klik.
- **appinstalled** – event po udanej instalacji; dobry moment na ukrycie przycisku i zapis w localStorage.
- **display-mode: standalone** – app uruchomiona jako „zainstalowana” (bez paska przeglądarki). `window.matchMedia("(display-mode: standalone)").matches`.
- **Strategie cache** – CacheFirst (offline-first), NetworkFirst (świeże dane, fallback do cache), StaleWhileRevalidate (serwuj z cache, w tle odśwież).
