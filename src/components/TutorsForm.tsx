import { useState, useCallback, useMemo, useId } from "react";
import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ArrowLeftSimpleIcon from "../assets/icons/arrow-left-simple.svg?url";
import { getTopicsForSubject, type Subject } from "../lib/subjectTopics";
import { useOnline } from "./hooks/useOnline";
import { withOnlineProvider } from "./hooks/withOnlineProvider";
import { validateFormInput } from "../lib/contentFilter";

const AVATAR_EMOJIS = ["👩", "🥷", "🧙‍♂️", "👸"] as const;

const clearCurrentSession = () => {
  const historyJson = localStorage.getItem("chatHistory");
  if (!historyJson) return;
  try {
    const history = JSON.parse(historyJson);
    history.currentSessionId = null;
    localStorage.setItem("chatHistory", JSON.stringify(history));
  } catch (e) {
    console.error("Error clearing current session:", e);
  }
};

function TutorsForm() {
  const isOnline = useOnline();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [interests, setInterests] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const topicLabelId = useId();

  const handleSubjectSelect = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTopic("");
  }, []);

  const handleTopicChange = useCallback((value: string) => setSelectedTopic(value), []);
  const handleProblemChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setProblemDescription(e.target.value),
    []
  );
  const handleInterestsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setInterests(e.target.value),
    []
  );
  const handleAvatarSelect = useCallback((emoji: string) => setSelectedAvatar(emoji), []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedSubject || !selectedTopic || !problemDescription.trim() || !selectedAvatar) return;

      // Validate problem description
      const problemValidation = validateFormInput(problemDescription, "Opis problemu", 200);
      if (!problemValidation.isValid) {
        setFormError(problemValidation.error || "Nieprawidłowy opis problemu");
        return;
      }

      // Validate interests
      const interestsValidation = validateFormInput(interests, "Zainteresowania", 100);
      if (!interestsValidation.isValid) {
        setFormError(interestsValidation.error || "Nieprawidłowe zainteresowania");
        return;
      }

      setFormError(null);

      localStorage.setItem(
        "studentData",
        JSON.stringify({
          subject: selectedSubject,
          topic: selectedTopic,
          problem: problemValidation.sanitized || problemDescription.trim(),
          interests: interestsValidation.sanitized || interests,
          avatar: selectedAvatar,
        })
      );

      clearCurrentSession();
      setTimeout(() => {
        window.location.href = "/chat";
      }, 0);
    },
    [selectedSubject, selectedTopic, problemDescription, interests, selectedAvatar]
  );

  const availableTopics = useMemo(() => getTopicsForSubject(selectedSubject), [selectedSubject]);
  const isFormValid = useMemo(
    () => Boolean(selectedSubject && selectedTopic && problemDescription.trim() && selectedAvatar),
    [selectedSubject, selectedTopic, problemDescription, selectedAvatar]
  );

  const handleMathClick = useCallback(() => handleSubjectSelect("matematyka"), [handleSubjectSelect]);
  const handleEnglishClick = useCallback(() => handleSubjectSelect("angielski"), [handleSubjectSelect]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6">
      {formError && (
        <div className="w-full max-w-[350px] p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {formError}
        </div>
      )}
      <fieldset className="flex flex-col gap-4 sm:flex-row">
        <legend className="sr-only">Wybierz przedmiot</legend>
        <button
          type="button"
          onClick={handleMathClick}
          disabled={!isOnline}
          aria-pressed={selectedSubject === "matematyka"}
          className={`relative overflow-hidden py-4 px-8 text-lg font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedSubject === "matematyka"
              ? "bg-primary text-primary-foreground shadow-lg scale-105 hover:shadow-xl"
              : "bg-muted hover:bg-accent/30 text-foreground hover:shadow-md hover:-translate-y-1"
          }`}
        >
          <span className="mr-2 text-2xl">📐</span>
          Matematyka
        </button>
        <button
          type="button"
          onClick={handleEnglishClick}
          // disabled={!isOnline}
          disabled={true}
          aria-pressed={selectedSubject === "angielski"}
          className={`relative overflow-hidden py-4 px-8 text-lg font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedSubject === "angielski"
              ? "bg-primary text-primary-foreground shadow-lg scale-105 hover:shadow-xl"
              : "bg-muted hover:bg-accent/30 text-foreground hover:shadow-md hover:-translate-y-1"
          }`}
        >
          <span className="mr-2 text-2xl">🇬🇧</span>
          Język angielski
        </button>
      </fieldset>

      {selectedSubject && (
        <>
          {/* Topic Selection Dropdown */}
          <div className="flex flex-col gap-2 w-full max-w-[350px]">
            <label id={topicLabelId} htmlFor="topic-select" className="text-sm text-gray-900">
              Wybierz temat:
            </label>
            <Select value={selectedTopic} onValueChange={handleTopicChange} required>
              <SelectTrigger
                id="topic-select"
                className="w-full border-solid border-2 border-[#006fea] h-12"
                aria-labelledby={topicLabelId}
              >
                <SelectValue placeholder="Wybierz temat" />
              </SelectTrigger>
              <SelectContent>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Problem Description Input */}
          <div className="flex flex-col gap-2 w-full max-w-[350px]">
            <label htmlFor="problem-description" className="text-sm text-gray-900">
              Opisz szczegółowo swój problem:
            </label>
            <Input
              id="problem-description"
              type="text"
              value={problemDescription}
              onChange={handleProblemChange}
              placeholder="np. Nie rozumiem logarytmów"
              className="w-full text-sm border-solid border-2 border-[#006fea] h-12"
              required
              maxLength={200}
            />
            <p className="text-xs text-gray-500 text-right">{problemDescription.length} / 200</p>
          </div>

          {/* Interests Input */}
          <div className="flex flex-col gap-2 w-full max-w-[350px]">
            <label htmlFor="interests" className="text-sm text-gray-900">
              Twoje zainteresowania:
            </label>
            <Input
              id="interests"
              type="text"
              value={interests}
              onChange={handleInterestsChange}
              placeholder="np. piłka nożna, książki, filmy"
              className="w-full text-sm border-solid border-2 border-[#006fea] h-12"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500 text-right">{interests.length} / 100</p>
          </div>

          {/* Avatar Selection */}
          <div className="flex flex-col items-center gap-4 w-full max-w-[350px]">
            <p className="text-sm font-medium text-foreground self-start">Wybierz swój avatar:</p>
            <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Wybierz avatar">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAvatarSelect(emoji)}
                  className={`text-4xl p-3 min-w-[56px] min-h-[56px] rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                    selectedAvatar === emoji
                      ? "bg-primary/10 ring-4 ring-primary scale-110 shadow-lg"
                      : "bg-muted hover:bg-accent/20 hover:shadow-md"
                  }`}
                  aria-label={`Wybierz avatar ${emoji}`}
                  aria-pressed={selectedAvatar === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <Button type="submit" disabled={!isFormValid} variant="ok" className="text-lg py-3">
          Rozpocznij lekcję
        </Button>
        <a href="/" className={buttonVariants({ variant: "back" })}>
          <img src={ArrowLeftSimpleIcon} alt="" width={20} height={16} className="w-5 h-4" aria-hidden="true" />
          Strona główna
        </a>
      </div>
    </form>
  );
}

export default withOnlineProvider(TutorsForm);
