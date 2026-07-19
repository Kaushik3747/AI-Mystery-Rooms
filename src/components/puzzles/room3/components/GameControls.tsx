
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface GameControlsProps {
  onRestart: () => void;
  onNextPuzzle: () => void;
  gameCompleted: boolean;
  puzzle: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onRestart,
  onNextPuzzle,
  gameCompleted,
  puzzle
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-4">
      <Button
        variant="outline"
        onClick={onRestart}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-4 w-4" />
        Restart Puzzle
      </Button>
      
      {gameCompleted && (
        <Button
          onClick={onNextPuzzle}
          className="flex items-center gap-1"
        >
          Next Puzzle ({puzzle}/3)
        </Button>
      )}
    </div>
  );
};

export default GameControls;
