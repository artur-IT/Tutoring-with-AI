import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ArrowLeftSimpleIcon from "../assets/icons/arrow-left-simple.svg?url";

type Subject = "matematyka" | "chemia" | null;

export default function TutorsForm() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(null);
  const [problemDescription, setProblemDescription] = useState("");
  const [interests, setInterests] = useState("");

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };
  const handleProblemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProblemDescription(e.target.value);
  };
  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterests(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubject) return;

    // Save studentData to localStorage before redirecting
    const studentData = {
      subject: selectedSubject,
      problem: problemDescription,
      interests: interests,
    };
    localStorage.setItem("studentData", JSON.stringify(studentData));

    window.location.href = "/chat";
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6">
      {/* Subject Selection Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row ">
        <Button
          type="button"
          onClick={() => handleSubjectSelect("matematyka")}
          className={`py-3 px-6 text-base font-medium rounded-xl transition-all ${selectedSubject === "matematyka"
            ? "bg-green-600 text-white shadow-md"
            : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
        >
          Matematyka
        </Button>
        <Button
          type="button"
          onClick={() => handleSubjectSelect("chemia")}
          className={`py-3 px-6 text-base font-medium rounded-xl transition-all ${selectedSubject === "chemia"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
        >
          Chemia
        </Button>
      </div>

      {/* Problem Description Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="problem-description" className="text-base font-medium text-gray-900">
          Czego dokładnie dotyczy problem?
        </label>
        <Input
          id="problem-description"
          type="text"
          value={problemDescription}
          onChange={handleProblemChange}
          placeholder="np. równania, geometria itp."
          className="w-[350px]"
          aria-label="Opisz problem"
          required
        />
      </div>

      {/* Interests Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="interests" className="text-base font-medium text-gray-900">
          Twoje zainteresowania:
        </label>
        <Input
          id="interests"
          type="text"
          value={interests}
          onChange={handleInterestsChange}
          placeholder="krótko np. piłka nożna, książki, filmy itp."
          className="w-[350px]"
          aria-label="Podaj swoje zainteresowania"
          required
        />
      </div>

      {/* Avatar Selection */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl">😊</span>
        <p className="text-sm text-gray-500">(wybierz swój avatar)</p>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={!selectedSubject} variant="ok">
        Zaczynamy
      </Button>

      {/* Back Button */}
      <Button onClick={() => window.location.href = "/"} variant="back">
        <img src={ArrowLeftSimpleIcon} alt="" className="w-5 h-5" />
        wróć
      </Button>
    </form>
  );
}
