# Legacy Fighter - dodatkowe zadania Typescript

To repozytorium jest częścią kursu **Legacy Fighter**.

Projekt został przełożony z **Java** na **TypeScript**, aby ułatwić zrozumienie poszczególnych aspektów użytkownikom tego języka.

- Nie został użyty żaden framework do wystawienia endpointów, ponieważ nie było to konieczne. Zastosowano jedynie podstawowe funkcje języka.
- Do połączenia z bazą danych wykorzystano bibliotekę **Drizzle**, aby minimalizować zależność od technicznych aspektów frameworków i skupić się na koncepcjach omawianych w kursie.

- Nie wszystkie klasy są idealne – i takie mają pozostać. Refaktoryzacja jest procesem iteracyjnym. W tym projekcie skupiamy się na wybranych aspektach, a kolejne poprawki można wprowadzać w następnych iteracjach.

## Nawigacja po projekcie

Projekt posiada tylko jeden commit, ale wiele tagów.  
Aby poruszać się między tagami, należy użyć polecenia:

```bash
git checkout <nazwa tagu>
```

## Uruchomienie projektu

### Instalacja

Zainstaluj zależności:

```bash
npm i
```

### Uruchamianie projektu

Projekt działa wyłącznie w oparciu o testy – nie posiada własnego `runtime`.

Testy jednostkowe (`.unit.spec.ts`) zostały napisane z wykorzystaniem Vitest.
Testy integracyjne (`.int.spec.ts`) używają TestContainers do uruchamiania bazy danych na potrzeby testów.

Aby uruchomić wszystkie testy, użyj polecenia:

```bash
npm run test
```

## Kontakt

W razie pytań proszę o kontakt na email: [kontakt@dawidantczak.com](mailto:kontakt@dawidantczak.com)
