import { useState, useId, useEffect } from "react";
import { Button } from "./ui/button";
import { useUserName } from "./hooks/useUserName";

const MODAL_STATE_EVENT = "nameInputModalState";

export default function NameInput() {
  const [isOpen, setIsOpen] = useState(false);
  const { name, setName, saveName } = useUserName();
  const inputId = useId();
  const formId = useId();

  // Dispatch event when modal state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(MODAL_STATE_EVENT, { detail: { isOpen } }));
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = saveName(name);
    if (success) {
      setIsOpen(false);
    }
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);

  return (
    <>
      <Button onClick={handleOpen} variant="ok" aria-label="Otwórz formularz wprowadzania imienia">
        {!name ? "Podaj imię" : "Zmień imię"}
      </Button>
      {isOpen &&
        (<form
          id={formId}
          onSubmit={handleSubmit}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white p-3 rounded-lg shadow-lg min-w-[140px]"
        >
          <input
            id={inputId}
            type="text"
            value={name}
            maxLength={20}
            onChange={handleInputChange}
            placeholder="Wpisz imię"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="Wprowadź swoje imię"
            spellCheck={false}
            autoFocus={true}
          />
          <div className="flex gap-2 justify-center">
            <Button type="button" variant="cancel" onClick={handleClose}>
              Anuluj
            </Button>
            <Button type="submit" variant="ok" disabled={!name.trim()}>
              Zapisz
            </Button>
          </div>
        </form>)}
    </>

  );
}
