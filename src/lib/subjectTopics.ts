// Available topics for each subject
// Used in TutorsForm to let users select specific topics

export type Subject = "matematyka" | "angielski";

export type SubjectTopics = Record<string, string[]>;

// Topics for mathematics (high school level)
// Based on official curriculum for liceums and technical schools in Poland
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

// Topics for English (high school level)
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

// Map subject to its topics
export const SUBJECT_TOPICS: SubjectTopics = {
  matematyka: MATH_TOPICS,
  angielski: ENGLISH_TOPICS,
};

// Get topics for a specific subject
export const getTopicsForSubject = (subject: Subject | null): string[] => {
  if (!subject) return [];
  return SUBJECT_TOPICS[subject] || [];
};
