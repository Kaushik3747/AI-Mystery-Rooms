
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Game Room Types
export type RoomStatus = "locked" | "unlocked" | "completed";

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  status: RoomStatus;
  puzzles: Puzzle[];
}

// State Context Type
interface GameState {
  rooms: Room[];
  currentRoom: string | null;
  currentPuzzle: string | null;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updatePuzzleStatus: (roomId: string, puzzleId: string, completed: boolean) => void;
  setCurrentRoom: (roomId: string | null) => void;
  setCurrentPuzzle: (puzzleId: string | null) => void;
}

// Create Context
const GameStateContext = createContext<GameState | undefined>(undefined);

// Initial Game Data
const initialRooms: Room[] = [
  {
    id: "room1",
    name: "Logic Core",
    description: "Test your logical thinking with these AI puzzles",
    status: "unlocked",
    puzzles: [
      {
        id: "sudoku",
        title: "Neural Network Sudoku",
        description: "Solve the Sudoku puzzle with the help of AI constraint satisfaction",
        completed: false
      },
      {
        id: "pathfinder",
        title: "BFS Pathfinder",
        description: "Find the optimal path through the maze using breadth-first search",
        completed: false
      },
      {
        id: "logic",
        title: "Logic Gate Challenge",
        description: "Solve logical puzzles to discover the final password",
        completed: false
      }
    ]
  },
  {
    id: "room2",
    name: "Strategic Grid",
    description: "Defeat the AI in strategic gameplay",
    status: "locked",
    puzzles: [
      {
        id: "connect4",
        title: "Connect Four vs AI",
        description: "Win twice against the minimax algorithm to proceed",
        completed: false
      }
    ]
  },
  {
    id: "room3",
    name: "Blocks World",
    description: "Plan your moves to reorganize the blocks",
    status: "locked",
    puzzles: [
      {
        id: "blocks",
        title: "Cognitive Blocks Battle",
        description: "Compete against an AI planner in the classic Blocks World puzzle",
        completed: false
      }
    ]
  }
];

// Provider Component
export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [currentRoom, setCurrentRoom] = useState<string | null>("room1");
  const [currentPuzzle, setCurrentPuzzle] = useState<string | null>(null);

  // Update room status
  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId ? { ...room, status } : room
      )
    );

    // If a room is completed, unlock the next room
    if (status === "completed") {
      const currentIndex = rooms.findIndex(room => room.id === roomId);
      const nextRoom = rooms[currentIndex + 1];
      
      if (nextRoom) {
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === nextRoom.id ? { ...room, status: "unlocked" } : room
          )
        );
      }
    }
  };

  // Update puzzle status
  const updatePuzzleStatus = (roomId: string, puzzleId: string, completed: boolean) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId 
          ? { 
            ...room, 
            puzzles: room.puzzles.map(puzzle => 
              puzzle.id === puzzleId ? { ...puzzle, completed } : puzzle
            )
          } 
          : room
      )
    );

    // Check if all puzzles in the room are completed
    const updatedRoom = rooms.find(room => room.id === roomId);
    if (updatedRoom) {
      const allPuzzlesCompleted = updatedRoom.puzzles.every(puzzle => 
        puzzle.id === puzzleId ? completed : puzzle.completed
      );
      
      if (allPuzzlesCompleted) {
        updateRoomStatus(roomId, "completed");
      }
    }
  };

  const value = {
    rooms,
    currentRoom,
    currentPuzzle,
    updateRoomStatus,
    updatePuzzleStatus,
    setCurrentRoom,
    setCurrentPuzzle
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

// Hook for using the game state context
export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
