
import React from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SudokuPuzzle from '@/components/puzzles/room1/SudokuPuzzle';
import BFSPathfinder from '@/components/puzzles/room1/BFSPathfinder';
import LogicPuzzle from '@/components/puzzles/room1/LogicPuzzle';
import ConnectFour from '@/components/puzzles/room2/ConnectFour';
import BlocksWorld from '@/components/puzzles/room3/BlocksWorld';

const Room = () => {
  const { rooms, currentRoom, currentPuzzle, setCurrentPuzzle } = useGameState();
  
  if (!currentRoom) return null;
  
  const room = rooms.find(r => r.id === currentRoom);
  if (!room) return null;

  const renderPuzzle = () => {
    if (!currentPuzzle) return null;

    switch (currentPuzzle) {
      case 'sudoku':
        return <SudokuPuzzle />;
      case 'pathfinder':
        return <BFSPathfinder />;
      case 'logic':
        return <LogicPuzzle />;
      case 'connect4':
        return <ConnectFour />;
      case 'blocks':
        return <BlocksWorld />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {!currentPuzzle ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-mono font-bold text-primary glow mb-2">{room.name}</h2>
              <p className="text-muted-foreground">{room.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {room.puzzles.map((puzzle) => (
                <Card key={puzzle.id} className={`border ${
                  puzzle.completed ? 'border-accent' : 'border-primary'
                }`}>
                  <CardHeader>
                    <CardTitle className="font-mono text-lg">
                      {puzzle.title}
                    </CardTitle>
                    <CardDescription>
                      {puzzle.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      className="w-full font-mono"
                      onClick={() => setCurrentPuzzle(puzzle.id)}
                    >
                      {puzzle.completed ? "Review Puzzle" : "Start Puzzle"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            {renderPuzzle()}
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPuzzle(null)}
                className="font-mono"
              >
                Back to Room
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
