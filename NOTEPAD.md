Mistral API Key:
aiD9kZNHp11JSM1VaAR3EofNn2MNITFH

---

MOJE RULES
Zrefaktoryzuj kod stosując głównie te zalecenia:

- Javascript zgodny z ES8, ES9, ES11, ES12, ES2022, ES2023
- CSS wykorzystujący rozwiązania z roku 2025 i 5 lat wstecz
- React 19.2

---

#### Czy asChild jest potrzebne?

Tak, jeśli chcesz:

- Link wyglądający jak przycisk (lepsze SEO i dostępność)
- Przycisk jako inny komponent (np. Link z React Router)
- Zachować style Button, ale użyć innego elementu HTML

Jeśli zawsze używasz zwykłego `<button>`, możesz usunąć asChild, ale lepiej go zostawić — to standardowy wzorzec w Shadcn/ui i przydaje się w wielu sytuacjach.

Podsumowanie: asChild pozwala renderować Button jako inny element, zachowując jego style. To przydatne, gdy potrzebujesz linka wyglądającego jak przycisk.

Odnośnik tylko przekierowujący na inną stronę ze stylami z Button:

```html
<a href="/" class="inline-block">
  <button variant="back">Koniec na dziś</button>
</a>
```

Bez asChild (normalny przycisk)

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

---

#### **Kiedy cva i cn** są przydatne:

Gdy masz wiele wariantów i kombinacji (np. size + variant + color)
Gdy chcesz dynamicznie łączyć klasy z props

---

#### Kiedy useCallback jest przydatny:

Gdy przekazujesz funkcję do komponentu opakowanego w React.memo()
Gdy funkcja jest zależnością w useEffect, useMemo lub innym hooku

---

# Astro - PODSTAWY

## 1. Struktura projektu (musisz znać tylko 3 rzeczy)

a. `📁 src/pages/`

Każdy plik = jedna strona.

`src/pages/index.astro → /`

`src/pages/about.astro → /about`

Astro działa jak Next.js sprzed lat: routing = nazwa pliku

#### b. `src/components/`

Twoje komponenty, np. Header.astro, Card.astro.

#### c. `astro.config.mjs`

Konfiguracja, np. dodanie Reacta:

```javascript
import react from "@astrojs/react";

export default {
  integrations: [react()],
};
```

## 3. Składnia plików .astro (najważniejsze 10 linijek)

Myśl: `góra = logika, dół = HTML`

---

to jest „script” uruchamiany po stronie serwera

`const title = "Hello world";`

```html
<html>
  <body>
    <h1>{title}</h1>
  </body>
</html>
```

Najważniejsze:

- Masz frontmatter (blok ---), tak jak w Markdown.
- Masz czysty HTML + {}
- Masz dostęp do JS/TS, ale działa na serwerze, nie w przeglądarce.

Dlatego Astro jest szybkie jak błyskawica.

## 4. Twój pierwszy komponent Astro

`src/components/Card.astro:`

`const { title, text } = Astro.props;`

```html
<div class="card">
  <h2>{title}</h2>
  <p>{text}</p>
</div>
```

Użycie:

`<Card title="Pierwszy" text="To jest mój pierwszy komponent w Astro" />`

Zero JS wysyłane do przeglądarki.

## 5. Jak używać React w Astro

Stwórz Reactowy komponent:

```javascript
src/components/Counter.jsx:

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}`
```

Użyj go w .astro:

```javascript
<Counter client:load />

// Musisz dodać client:*, inaczej Astro nie wyśle JS do przeglądarki.

Najczęstsze tryby:

    client:load – ładowane od razu

    client:visible – dopiero gdy widoczne

    client:idle – gdy przeglądarka ma luz

To jest tzw. Islands Architecture.
```

## 6. Style w Astro (prosto i skutecznie)

Masz 2 opcje:

#### Opcja A – style tylko w komponencie (najwygodniejsza)

```css
<style>
.card {
  padding: 1rem;
  border: 1px solid #ddd;
}
</style>
```

Izolowane jak CSS Modules.

#### Opcja B – globalne style:

```html
src/styles/global.css i dodajesz:

<link rel="stylesheet" href="/styles/global.css" />
```

## 7. Strona główna

```javascript
src/pages/index.astro:

---
import Card from "../components/Card.astro";

const items = [
  { title: "Pierwsza karta", text: "Przykład 1" },
  { title: "Druga karta", text: "Przykład 2" },
];
---
<html>
  <body>
    <h1>Moja pierwsza aplikacja w Astro</h1>

    {items.map(item => (
      <Card title={item.title} text={item.text} />
    ))}
  </body>
</html>
```

# Co musisz poznać PO tych podstawach?

Kolejność:

- Routing (dynamiczne strony, [id].astro)
- Layouty (src/layouts/BaseLayout.astro)
- Fetching danych (await fetch())
- React islands (client:load)
- Integracje (React, Tailwind, MDX)
- Deployment (Netlify / Vercel)`
