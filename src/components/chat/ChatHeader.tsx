import { Button } from "../ui/button";

type ChatHeaderProps = {
  sessionName: string;
  onEnd: () => void;
};

export default function ChatHeader({ sessionName, onEnd }: ChatHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="Lekcja">
            💡
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">Twoja lekcja</h1>
            {sessionName && <p className="text-sm text-muted-foreground mt-1">{sessionName}</p>}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="back" onClick={onEnd}>
          Zakończ i zapisz
        </Button>
      </div>
    </header>
  );
}
