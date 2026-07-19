
import React from 'react';
import { useGameState, RoomStatus } from '@/contexts/GameStateContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ChevronRight, Lock, CheckCircle, Medal } from 'lucide-react';

const RoomHub = () => {
  const { rooms, setCurrentRoom } = useGameState();

  const getRoomStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Brain className="h-5 w-5 text-primary" />;
    }
  };

  // Check if the player has completed all three rooms
  const allRoomsCompleted = rooms.every(room => room.status === 'completed');
  
  // Specifically check if room 3 is completed (this means they've escaped)
  const room3 = rooms.find(room => room.id === 'room3');
  const hasEscaped = room3?.status === 'completed';

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-mono font-bold mb-4 text-primary glow">
            AI ESCAPE ROOM
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escape from three rooms by solving puzzles powered by artificial intelligence algorithms.
            Can you outsmart the machine?
          </p>
          
          {hasEscaped && (
            <div className="bg-accent/20 border border-accent rounded-md p-6 mt-6 max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Medal className="h-8 w-8 text-yellow-500" />
                <h2 className="text-2xl font-mono font-bold text-accent">CONGRATULATIONS!</h2>
                <Medal className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-lg">
                You've successfully escaped the AI Escape Room by solving all the puzzles!
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className={`border ${
              room.status === 'locked' ? 'border-muted' : 
              room.status === 'completed' ? 'border-accent' : 'border-primary neon-border'
            } bg-card transition-all duration-300 hover:scale-[1.02]`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-mono">
                    {room.name}
                  </CardTitle>
                  <div>
                    {getRoomStatusIcon(room.status)}
                  </div>
                </div>
                <CardDescription>
                  {room.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono mb-2">Puzzles:</p>
                <div className="space-y-2">
                  {room.puzzles.map((puzzle) => (
                    <div key={puzzle.id} className="flex items-center gap-2">
                      <Badge variant={puzzle.completed ? "secondary" : "outline"} className="font-mono">
                        {puzzle.completed ? "SOLVED" : "UNSOLVED"}
                      </Badge>
                      <span className="text-sm">{puzzle.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full font-mono"
                  variant={room.status === "locked" ? "outline" : "default"}
                  disabled={room.status === "locked"}
                  onClick={() => setCurrentRoom(room.id)}
                >
                  {room.status === "locked" ? "Locked" : "Enter Room"}
                  {room.status !== "locked" && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomHub;
