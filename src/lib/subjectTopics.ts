export type Subject = "matematyka" | "angielski";

export type SubjectTopics = Record<string, string[]>;

export const MATH_TOPICS = [
  "Liczby rzeczywiste i wyrażenia algebraiczne",
  "Równania i nierówności",
  "Funkcje liniowe",
  "Funkcje kwadratowe",
  "Funkcje wymierne",
  "Funkcje wykładnicze",
  "Funkcje logarytmiczne",
  "Geometria płaska (planimetria)",
  "Geometria analityczna",
  "Geometria przestrzenna (stereometria)",
  "Trygonometria",
  "Ciągi",
  "Kombinatoryka",
  "Statystyka i prawdopodobieństwo",
  "Granice funkcji",
  "Rachunek różniczkowy",
  "Rachunek całkowy",
  "Inne",
];

export const ENGLISH_TOPICS = [
  "Gramatyka",
  "Słownictwo",
  "Czytanie ze zrozumieniem",
  "Pisanie",
  "Słuchanie",
  "Mówienie",
  "Czasy gramatyczne",
  "Inne",
];

export const SUBJECT_TOPICS: SubjectTopics = {
  matematyka: MATH_TOPICS,
  angielski: ENGLISH_TOPICS,
};

export const getTopicsForSubject = (subject: Subject | null) => (subject ? SUBJECT_TOPICS[subject] || [] : []);
