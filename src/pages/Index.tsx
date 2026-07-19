
import React from 'react';
import { GameStateProvider } from '@/contexts/GameStateContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RoomHub from '@/components/rooms/RoomHub';
import Room from '@/components/rooms/Room';
import { useGameState } from '@/contexts/GameStateContext';

const GameContent = () => {
  const { currentRoom } = useGameState();

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow py-6 animate-fade-in">
        {currentRoom ? <Room /> : <RoomHub />}
      </div>
      <Footer />
    </main>
  );
};

const Index = () => {
  return (
    <GameStateProvider>
      <GameContent />
    </GameStateProvider>
  );
};

export default Index;
