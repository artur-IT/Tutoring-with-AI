# Codzienny Schemat Pracy dla Programistów

Przewodnik po codziennej rutynie pracy nad projektem, aby utrzymać produktywność i uniknąć chaosu.

## 🌅 Start Dnia (5-10 min)

### 1. Sprawdź Status Projektu

- Sprawdź na jakim branchu jesteś
- Sprawdź czy masz niezcommitowane zmiany
- Przypomnij sobie nad czym pracowałeś

### 2. Zaktualizuj Kod

```bash
git pull origin main
```

### 3. Przejrzyj TODO/Zadania

- Co planujesz dzisiaj zrobić?
- Jaki jest priorytet?

## 💻 Podczas Pracy

### Dla Każdego Zadania:

#### 1. Stwórz Nowy Branch

```bash
git checkout -b feat/nazwa-funkcji
# lub
git checkout -b fix/nazwa-buga
```

#### 2. Pracuj Małymi Krokami

- Rób jedną rzecz na raz
- Testuj często (odświeżaj stronę, sprawdzaj w przeglądarce)
- Czytaj błędy w konsoli

#### 3. Commituj Regularnie (co 15-30 min pracy)

- Małe commity = łatwiej cofnąć się jeśli coś pójdzie nie tak
- Commit messages po angielsku, jasne i zrozumiałe

#### 4. Sprawdzaj Lintera
- Napraw błędy przed commitowaniem

## 🔄 Po Skończeniu Funkcji

### 1. Przetestuj Wszystko

- Czy działa na telefonie (responsive)?
- Czy nie zepsułeś czegoś innego?

### 2. Zmerguj do Main

```bash
git checkout main
git merge feat/nazwa-funkcji
git push
```

### 3. Usuń Stary Branch (opcjonalnie)

```bash
git branch -d feat/nazwa-funkcji
```

## 🌙 Koniec Dnia (5 min)

### 1. Zapisz Wszystko

Commitnij nawet niedokończoną pracę:

```bash
git add .
git commit -m "WIP: working on feature X"
```

### 2. Zapisz Notatki

- Co zrobiłeś dzisiaj?
- Co zostało do zrobienia?
- Jakie problemy napotkałeś?


## 🎯 Złote Zasady

1. **Commituj często** - lepiej 10 małych commitów niż 1 wielki
2. **Testuj na bieżąco** - nie pisz 100 linii bez sprawdzenia czy działa
3. **Jeden branch = jedna funkcja** - nie mieszaj wszystkiego
4. **Czytaj błędy** - zawsze zawierają wskazówki co jest nie tak
5. **Backup = push** - Twoja praca jest bezpieczna tylko gdy jest na GitHubie

## 📅 Zadania Tygodniowe

- **Przejrzyj swoje commity** - czego się nauczyłeś?
- **Posprzątaj branche** - usuń stare, zmergowane
- **Zaktualizuj dokumentację** - jeśli coś się zmieniło

```bash

```

# Szybka Ściągawka

### Konwencja Nazewnictwa Branchy

- `feat/nazwa-funkcji` - nowa funkcjonalność
- `fix/nazwa-buga` - naprawa błędu
- `refactor/co-refaktorujesz` - refaktoryzacja kodu
- `docs/co-dokumentujesz` - zmiany w dokumentacji

### Format Wiadomości Commit

```bash
add feature X
update component Y
fix bug in Z
refactor user service
```

**Commit message:**
- Krótko (50 znaków lub mniej)
- W trybie rozkazującym ("add" nie "added")
- Jasno o tym co się zmieniło
- Po angielsku (standard w programowaniu)
