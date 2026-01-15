import { Button } from "../ui/button";

type ChatHeaderProps = {
  sessionName: string;
  onEnd: () => void;
};

export default function ChatHeader({ sessionName, onEnd }: ChatHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
        {sessionName && <p className="text-xs text-gray-500 mt-1">{sessionName}</p>}
      </div>
      <div className="flex gap-2">
        <Button variant="back" onClick={onEnd}>
          Koniec
        </Button>
      </div>
    </header>
  );
}
