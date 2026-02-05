export type Subject = "matematyka";

type SubjectTopics = Record<string, string[]>;

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

const SUBJECT_TOPICS: SubjectTopics = {
  matematyka: MATH_TOPICS,
};

export const getTopicsForSubject = (subject: Subject | null) => (subject ? SUBJECT_TOPICS[subject] || [] : []);
