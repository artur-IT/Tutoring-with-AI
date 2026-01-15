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
        <Button variant="ok" aria-label="Otwórz formularz wprowadzania imienia" suppressHydrationWarning>
          {!name ? "Podaj imię" : "Zmień imię"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form id={formId} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Wprowadź swoje imię</DialogTitle>
            <DialogDescription>Twoje imię będzie użyte w rozmowach z korepetytorem.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id={inputId}
              type="text"
              value={name}
              maxLength={20}
              onChange={handleInputChange}
              placeholder="Wpisz imię"
              aria-label="Wprowadź swoje imię"
              spellCheck={false}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="cancel" onClick={handleClose}>
              Anuluj
            </Button>
            <Button type="submit" variant="ok" disabled={!name.trim()}>
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
