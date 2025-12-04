MOJE RULES
Zrefaktoryzuj kod stosując głównie te zalecenia:

- Javascript zgodny z ES6

---

#### Czy asChild jest potrzebne?

Tak, jeśli chcesz:

- Link wyglądający jak przycisk (lepsze SEO i dostępność)
- Przycisk jako inny komponent (np. Link z React Router)
- Zachować style Button, ale użyć innego elementu HTML
  Jeśli zawsze używasz zwykłego <button>, możesz usunąć asChild, ale lepiej go zostawić — to standardowy wzorzec w Shadcn/ui i przydaje się w wielu sytuacjach.
  Podsumowanie: asChild pozwala renderować Button jako inny element, zachowując jego style. To przydatne, gdy potrzebujesz linka wyglądającego jak przycisk.

Odnośnik tylko przekierowujący na inną stronę ze stylami z Button:
<a href='/' class='inline-block'>
<Button variant='back'>Koniec na dziś</Button>
</a>

Bez asChild (normalny przycisk)
<Button>Kliknij mnie</Button>
// Renderuje: <button className="...">Kliknij mnie</button>

Z asChild (przycisk jako link):
<Button asChild>
<a href="/strona">Kliknij mnie</a>
</Button>
// Renderuje: <a href="/strona" className="...">Kliknij mnie</a>

---

Kiedy cva i cn są przydatne:
Gdy masz wiele wariantów i kombinacji (np. size + variant + color)
Gdy chcesz dynamicznie łączyć klasy z props

---

#### Kiedy useCallback jest przydatny:

Gdy przekazujesz funkcję do komponentu opakowanego w React.memo()
Gdy funkcja jest zależnością w useEffect, useMemo lub innym hooku

---
