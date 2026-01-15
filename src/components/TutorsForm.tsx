import { useState, useCallback, useMemo, useId } from "react";
import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ArrowLeftSimpleIcon from "../assets/icons/arrow-left-simple.svg?url";
import { getTopicsForSubject, type Subject } from "../lib/subjectTopics";
import { useOnline } from "./hooks/useOnline";
import { withOnlineProvider } from "./hooks/withOnlineProvider";

const AVATAR_EMOJIS = ["🦊", "🐼", "🦁", "🐶", "🐱"] as const;

const getSubjectButtonStyles = (isSelected: boolean, isDisabled: boolean) =>
  `py-3 px-6 text-base font-medium rounded-xl transition-all ${isSelected ? "bg-blue-600 text-white shadow-md" : "bg-blue-100 text-blue-700 hover:bg-blue-200"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`;

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

      localStorage.setItem(
        "studentData",
        JSON.stringify({
          subject: selectedSubject,
          topic: selectedTopic,
          problem: problemDescription.trim(),
          interests,
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
      <fieldset className="flex flex-col gap-4 sm:flex-row">
        <legend className="sr-only">Wybierz przedmiot</legend>
        <Button
          type="button"
          onClick={handleMathClick}
          disabled={!isOnline}
          aria-pressed={selectedSubject === "matematyka"}
          className={getSubjectButtonStyles(selectedSubject === "matematyka", !isOnline)}
        >
          Matematyka
        </Button>
        <Button
          type="button"
          onClick={handleEnglishClick}
          disabled={!isOnline}
          aria-pressed={selectedSubject === "angielski"}
          className={getSubjectButtonStyles(selectedSubject === "angielski", !isOnline)}
        >
          Język angielski
        </Button>
      </fieldset>

      {selectedSubject && (
        <>
          {/* Topic Selection Dropdown */}
          <div className="flex flex-col gap-2">
            <label id={topicLabelId} htmlFor="topic-select" className="text-sm text-gray-900">
              Wybierz temat:
            </label>
            <Select value={selectedTopic} onValueChange={handleTopicChange} required>
              <SelectTrigger id="topic-select" className="w-[350px]" aria-labelledby={topicLabelId}>
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
          <div className="flex flex-col gap-2">
            <label htmlFor="problem-description" className="text-sm text-gray-900">
              Opisz szczegółowo swój problem:
            </label>
            <Input
              id="problem-description"
              type="text"
              value={problemDescription}
              onChange={handleProblemChange}
              className="w-[350px] text-sm"
              required
            />
          </div>

          {/* Interests Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="interests" className="text-sm text-gray-900">
              Twoje zainteresowania:
            </label>
            <Input
              id="interests"
              type="text"
              value={interests}
              onChange={handleInterestsChange}
              placeholder="krótko np. piłka nożna, książki, filmy itp."
              className="w-[350px] text-sm"
              required
            />
          </div>

          {/* Avatar Selection */}
          <div className="flex flex-col items-center gap-3 w-[350px]">
            <p className="text-sm text-gray-900 self-start">Wybierz swój avatar:</p>
            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Wybierz avatar">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAvatarSelect(emoji)}
                  className={`text-3xl p-2 rounded-lg transition-all hover:scale-110 ${selectedAvatar === emoji ? "bg-blue-100 ring-2 ring-blue-500 scale-110" : "bg-gray-50 hover:bg-gray-100"}`}
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

      <div className="flex flex-col gap-4 mt-6">
        <Button type="submit" disabled={!isFormValid} variant="ok">
          Do nauki
        </Button>
        <a href="/" className={buttonVariants({ variant: "back" })}>
          <img src={ArrowLeftSimpleIcon} alt="" width={20} height={16} className="w-5 h-4" aria-hidden="true" />
          powrót
        </a>
      </div>
    </form>
  );
}

export default withOnlineProvider(TutorsForm);
