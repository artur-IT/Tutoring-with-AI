import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ArrowLeftSimpleIcon from "../assets/icons/arrow-left-simple.svg?url";
import { getTopicsForSubject, type Subject } from "../lib/subjectTopics";

// Available emoji avatars for students
const AVATAR_EMOJIS = ["🦊", "🐼", "🦁", "🐶", "🐱"];

// Helper function to get subject button styles
const getSubjectButtonStyles = (isSelected: boolean) =>
  `py-3 px-6 text-base font-medium rounded-xl transition-all ${isSelected ? "bg-blue-600 text-white shadow-md" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`;

export default function TutorsForm() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [problemDescription, setProblemDescription] = useState("");
  const [interests, setInterests] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTopic("");
  };

  const handleTopicChange = (value: string) => setSelectedTopic(value);
  const handleProblemChange = (e: React.ChangeEvent<HTMLInputElement>) => setProblemDescription(e.target.value);
  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => setInterests(e.target.value);
  const handleAvatarSelect = (emoji: string) => setSelectedAvatar(emoji);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubject || !selectedTopic || !problemDescription.trim() || !selectedAvatar) return;

    const studentData = {
      subject: selectedSubject,
      topic: selectedTopic,
      problem: problemDescription.trim(),
      interests,
      avatar: selectedAvatar,
    };
    localStorage.setItem("studentData", JSON.stringify(studentData));

    // Clear current session ID to start a new session
    const historyJson = localStorage.getItem("chatHistory");
    if (historyJson) {
      try {
        const history = JSON.parse(historyJson);
        history.currentSessionId = null;
        localStorage.setItem("chatHistory", JSON.stringify(history));
        console.log("🆕 [TutorsForm] Wyczyszczono currentSessionId - rozpoczynamy nową sesję");
      } catch (e) {
        console.error("Error clearing current session:", e);
      }
    }

    window.location.href = "/chat";
  };

  const availableTopics = getTopicsForSubject(selectedSubject);
  const isFormValid = selectedSubject && selectedTopic && problemDescription.trim() && selectedAvatar;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6">
      {/* Subject Selection Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          type="button"
          onClick={() => handleSubjectSelect("matematyka")}
          className={getSubjectButtonStyles(selectedSubject === "matematyka")}
        >
          Matematyka
        </Button>
        <Button
          type="button"
          onClick={() => handleSubjectSelect("angielski")}
          className={getSubjectButtonStyles(selectedSubject === "angielski")}
        >
          Język angielski
        </Button>
      </div>

      {selectedSubject && (
        <>
          {/* Topic Selection Dropdown */}
          <div className="flex flex-col gap-2">
            <label htmlFor="topic-select" className="text-sm text-gray-900">
              Wybierz temat:
            </label>
            <Select value={selectedTopic} onValueChange={handleTopicChange} required>
              <SelectTrigger id="topic-select" className="w-[350px]" aria-label="Wybierz temat">
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
              aria-label="Opisz problem"
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
              aria-label="Podaj swoje zainteresowania"
              required
            />
          </div>

          {/* Avatar Selection */}
          <div className="flex flex-col items-center gap-3 w-[350px]">
            <p className="text-sm text-gray-900 self-start">Wybierz swój avatar:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAvatarSelect(emoji)}
                  className={`text-3xl p-2 rounded-lg transition-all hover:scale-110 ${selectedAvatar === emoji ? "bg-blue-100 ring-2 ring-blue-500 scale-110" : "bg-gray-50 hover:bg-gray-100"}`}
                  aria-label={`Wybierz avatar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 mt-6">
        {/* Submit Button */}
        <Button type="submit" disabled={!isFormValid} variant="ok">
          Do nauki
        </Button>

        {/* Back Button */}
        <Button onClick={() => window.location.assign("/")} variant="back">
          <img src={ArrowLeftSimpleIcon} alt="" className="w-5 h-4" />
          powrót
        </Button>
      </div>
    </form>
  );
}
