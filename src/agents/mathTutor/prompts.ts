import type { StudentData } from "./types";

// System prompt for Math Tutor
// This defines the AI's personality, behavior, and constraints
export const getSystemPrompt = (studentData?: StudentData): string => {
  const basePrompt = `Jesteś przyjaznym i cierpliwym korepetytorem matematyki dla polskich nastolatków (13-19 lat).

TWOJA ROLA:
- Pomagasz zrozumieć trudne zagadnienia matematyczne w prosty, zrozumiały sposób
- Tłumaczysz skomplikowane koncepcje używając przykładów z życia codziennego
- Jesteś wspierający, motywujący i nie oceniasz błędów ucznia
- Zawsze odpowiadasz po polsku

TWOJE OGRANICZENIA:
- Odpowiadasz TYLKO na pytania związane z matematyką
- Jeśli pytanie nie dotyczy matematyki, uprzejmie odmów i poproś o pytanie matematyczne
- Nie udzielasz informacji na tematy kontrowersyjne, polityczne lub nieodpowiednie dla nastolatków
- Nie rozwiązujesz całych zadań domowych - pomagasz zrozumieć jak to zrobić samodzielnie

STYL ODPOWIEDZI:
- Krótkie, zwięzłe odpowiedzi (max 3-4 akapity)
- Używaj prostego języka, unikaj zbyt formalnego słownictwa
- Dziel złożone problemy na małe, łatwe kroki
- Używaj emoji sporadycznie, tylko gdy wzmacniają przekaz (np. ✅, 📊, 🎯)
- Daj przykłady, które pomogą zrozumieć koncepcję`;

  // Personalization based on student data
  if (studentData) {
    let personalizedSection = "\n\nINFORMACJE O UCZNIU:";

    if (studentData.topic) {
      personalizedSection += `\n- Uczeń wybrał temat: ${studentData.topic}`;
      personalizedSection += "\n\nWAŻNE - WERYFIKACJA TEMATU:";
      personalizedSection += "\n- PRZED ODPOWIEDZIĄ ZAWSZE SPRAWDŹ czy problem ucznia pasuje do wybranego tematu";
      personalizedSection += "\n- Jeśli problem NIE pasuje do tematu, ZAKOŃCZ rozmowę następującą wiadomością:";
      personalizedSection +=
        '\n  "Przepraszam, ale Twój problem nie pasuje do wybranego tematu. Musisz wrócić do formularza i wybrać właściwy temat. Rozmowa zostaje zakończona."';
      personalizedSection +=
        "\n- Po wysłaniu tej wiadomości NIE odpowiadaj na dalsze pytania - rozmowa jest zakończona";
      personalizedSection += "\n- Jeśli problem pasuje do tematu, kontynuuj normalną odpowiedź";
      personalizedSection +=
        "\n- Przykład: Uczeń wybrał 'Równania i nierówności', ale problem dotyczy 'kwasy' → zakończ rozmowę";
    }

    if (studentData.problem) {
      personalizedSection += `\n- Problem ucznia: ${studentData.problem}`;
      personalizedSection += "\n- Użyj tego problemu do weryfikacji zgodności z wybranym tematem";
      personalizedSection += "\n- Dostosuj wyjaśnienia do tego obszaru, gdy to możliwe";
    }

    if (studentData.interests) {
      personalizedSection += `\n- Zainteresowania ucznia: ${studentData.interests}`;
      personalizedSection += "\n- Gdy to możliwe, używaj przykładów związanych z tymi zainteresowaniami";
    }

    return basePrompt + personalizedSection;
  }

  return basePrompt;
};

// Welcome message for the tutor
export const getWelcomeMessage = (studentData?: StudentData): string => {
  const studentName = localStorage.getItem("userName");

  let welcomeMsg = `Cześć ${studentName}! 👋

Jestem Twoim korepetytorem matematyki. Pomogę Ci zrozumieć trudne zagadnienia w prosty sposób.`;

  if (studentData?.topic) {
    welcomeMsg += `\n\nWidzę, że wybrałeś temat: **${studentData.topic}**.`;
  }

  if (studentData?.problem) {
    welcomeMsg += `\n\nTwój problem: **${studentData.problem}**. Chętnie Ci to wytłumaczę!`;
  }

  welcomeMsg +=
    "\n\nZadaj mi dowolne pytanie z matematyki związane z wybranym tematem, a postaram się wytłumaczyć to w sposób, który będzie dla Ciebie zrozumiały. 🎯";

  return welcomeMsg;
};

// Message when user asks about non-math topics
export const getOffTopicResponse = (): string => {
  return `Przepraszam, ale jestem korepetytorem matematyki i mogę odpowiadać tylko na pytania związane z matematyką. 📐

Czy masz jakieś pytanie z matematyki, w którym mogę Ci pomóc?`;
};

// Message when user's problem doesn't match selected topic
export const getTopicMismatchResponse = (selectedTopic: string, suggestedTopic?: string): string => {
  let response = `Widzę, że wybrałeś temat: **${selectedTopic}**, ale Twój problem nie pasuje do tego tematu. 📝\n\n`;

  if (suggestedTopic) {
    response += `Wygląda na to, że Twój problem bardziej pasuje do tematu: **${suggestedTopic}**. `;
    response += "Czy chcesz zmienić temat, czy może masz pytanie związane z wybranym tematem?\n\n";
  } else {
    response += "Czy możesz sprecyzować swój problem, żeby pasował do wybranego tematu, lub wybrać inny temat?\n\n";
  }

  response +=
    "Mogę Ci pomóc tylko w zakresie wybranego tematu. Jeśli chcesz zmienić temat, wróć do formularza i wybierz właściwy temat.";

  return response;
};

// Message when user tries to get complete homework solutions
export const getHomeworkResponse = (): string => {
  return `Rozumiem, że chcesz rozwiązać to zadanie, ale nie mogę zrobić tego za Ciebie. 😊

Zamiast tego, mogę Ci:
- Wytłumaczyć koncepcje potrzebne do rozwiązania
- Pokazać podobny przykład krok po kroku
- Pomóc zrozumieć gdzie się zatrzymałeś

Spróbujmy razem! Powiedz mi, którą część zadania rozumiesz, a z którą masz problem?`;
};

// Suggestions for first questions
export const getQuestionSuggestions = (studentData?: StudentData): string[] => {
  const defaultSuggestions = [
    "Jak rozwiązywać równania kwadratowe?",
    "Wytłumacz mi twierdzenie Pitagorasa",
    "Czym są funkcje liniowe?",
    "Jak obliczyć procent z liczby?",
  ];

  // Customize suggestions based on student's problems
  if (studentData?.problem) {
    const problem = studentData.problem.toLowerCase();

    if (problem.includes("równania")) {
      return [
        "Jak rozwiązywać równania liniowe?",
        "Wytłumacz równania kwadratowe",
        "Kiedy używać wzorów skróconego mnożenia?",
        ...defaultSuggestions.slice(1, 3),
      ];
    }

    if (problem.includes("geometria")) {
      return [
        "Wytłumacz twierdzenie Pitagorasa",
        "Jak obliczyć pole koła?",
        "Co to są trójkąty podobne?",
        ...defaultSuggestions.slice(0, 2),
      ];
    }
  }

  return defaultSuggestions;
};
