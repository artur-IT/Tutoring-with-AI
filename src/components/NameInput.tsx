import { useState, useId, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
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
    // No need to return a value; effect is for dispatch only.
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saveName(name)) setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ok"
          aria-label={!name ? "Otwórz formularz wprowadzania imienia" : "Zmień swoje imię"}
          suppressHydrationWarning
          className="text-lg py-3 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          {!name ? "Podaj imię" : "Zmień imię"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
        <form id={formId} onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="text-4xl text-center mb-2">✏️</div>
            <DialogTitle className="text-2xl text-center">Wprowadź swoje imię</DialogTitle>
            <DialogDescription className="text-center">
              Twoje imię będzie użyte w rozmowach z korepetytorem.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor={inputId} className="sr-only">
              Imię
            </label>
            <Input
              id={inputId}
              type="text"
              value={name}
              maxLength={20}
              onChange={handleInputChange}
              placeholder="Wpisz imię"
              spellCheck={false}
              className="text-lg py-3"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="cancel" onClick={handleClose}>
              Anuluj
            </Button>
            <Button type="submit" variant="ok" disabled={!name.trim()}>
              <span className="text-xl mr-1">✓</span>
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
