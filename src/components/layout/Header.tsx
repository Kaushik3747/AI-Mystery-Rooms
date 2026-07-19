
import React from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';

const Header = () => {
  const { rooms, currentRoom, setCurrentRoom, setCurrentPuzzle } = useGameState();
  
  const handleBackToHub = () => {
    setCurrentRoom(null);
    setCurrentPuzzle(null);
  };

  return (
    <header className="border-b border-border bg-card p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-mono font-bold text-primary glow">
            AI ESCAPE ROOM
          </h1>
        </div>
        
        <nav className="hidden md:flex gap-4">
          {rooms.map(room => (
            <button
              key={room.id}
              className={`px-3 py-2 rounded-md font-mono transition-all ${
                room.status === "locked"
                  ? "text-muted-foreground cursor-not-allowed"
                  : room.status === "completed"
                  ? "text-accent hover:bg-muted"
                  : currentRoom === room.id
                  ? "text-primary bg-muted"
                  : "text-foreground hover:bg-muted"
              }`}
              disabled={room.status === "locked"}
              onClick={() => {
                if (room.status !== "locked") {
                  setCurrentRoom(room.id);
                  setCurrentPuzzle(null);
                }
              }}
            >
              {room.name}
              {room.status === "locked" && " 🔒"}
              {room.status === "completed" && " ✓"}
            </button>
          ))}
        </nav>
        
        {currentRoom && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToHub}
            className="font-mono"
          >
            Back to Hub
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
