
import React from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { Card, CardContent } from '@/components/ui/card';

// Import refactored components
import GameControls from './components/GameControls';
import StatusBadges from './components/StatusBadges';
import GameBoard from './components/GameBoard';
import { useBlocksWorld } from './hooks/useBlocksWorld';

// Required score to complete the room
const REQUIRED_SCORE = 2500;

const BlocksWorld = () => {
  const { updatePuzzleStatus } = useGameState();
  
  const {
    // Game states
    currentState,
    goalState,
    optimalPlan,
    
    // Game mechanics
    selectedBlock,
    moves,
    gameCompleted,
    puzzle,
    score,
    totalScore,
    
    // Timer state
    elapsedTime,
    
    // Methods
    generatePuzzle,
    handleBlockClick,
    handleStackClick,
    nextPuzzle,
    formatTime
  } = useBlocksWorld((puzzleId, status) => {
    // Only mark the room as completed if the total score requirement is met
    updatePuzzleStatus("room3", puzzleId, status && totalScore >= REQUIRED_SCORE);
  });
  
  if (!currentState || !goalState) return <div>Loading puzzle...</div>;
  
  const canEscape = totalScore >= REQUIRED_SCORE;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-mono font-bold text-secondary glow-secondary mb-2">
          Cognitive Blocks Battle
        </h2>
        <p className="text-muted-foreground mb-4">
          Rearrange the blocks to match the goal configuration
        </p>
        
        <GameControls 
          onRestart={generatePuzzle}
          onNextPuzzle={nextPuzzle}
          gameCompleted={gameCompleted}
          puzzle={puzzle}
        />
        
        <StatusBadges
          elapsedTime={elapsedTime}
          moves={moves}
          optimalPlanLength={optimalPlan.length}
          gameCompleted={gameCompleted}
          score={score}
          totalScore={totalScore}
          requiredScore={REQUIRED_SCORE}
          formatTime={formatTime}
        />
      </div>
      
      <GameBoard
        currentState={currentState}
        goalState={goalState}
        selectedBlock={selectedBlock}
        handleBlockClick={handleBlockClick}
        handleStackClick={handleStackClick}
      />
      
      {/* Game Complete Message */}
      {gameCompleted && (
        <div className={`${canEscape ? "bg-accent/10 border-accent" : "bg-muted/10 border-muted"} border rounded-md p-4 mb-8 text-center`}>
          <h3 className={`text-xl font-mono font-bold ${canEscape ? "text-accent" : "text-primary"} mb-2`}>
            Puzzle Completed!
          </h3>
          <p className="mb-2">
            You solved the puzzle in {moves} moves and {formatTime(elapsedTime)}
          </p>
          
          {puzzle >= 3 ? (
            canEscape ? (
              <p className="font-bold text-accent">
                Congratulations! With {totalScore}/{REQUIRED_SCORE} points, you have completed all puzzles and escaped from Room 3!
              </p>
            ) : (
              <p className="text-warning">
                You've completed all puzzles, but need at least {REQUIRED_SCORE} points to escape. 
                Current score: {totalScore}. Please restart to improve your score.
              </p>
            )
          ) : (
            <p>
              Proceed to puzzle {puzzle + 1}/3 to continue
            </p>
          )}
        </div>
      )}
      
      {/* How It Works Section */}
      <div className="mt-4 p-4 bg-muted rounded-md">
        <h3 className="text-lg font-mono font-bold mb-2">How it works</h3>
        <p className="text-sm mb-2">
          This puzzle uses AI planning algorithms to find the optimal sequence of moves between
          two states. In AI planning, the system searches for a sequence of actions that will
          transform the initial state into the goal state.
        </p>
        <p className="text-sm mb-2">
          Each round is worth 1000 points. Complete each puzzle in the optimal number of moves to earn full points.
          For each move beyond optimal, 100 points are deducted.
        </p>
        <p className="text-sm">
          Complete all three puzzles with at least 2500 total points to escape Room 3!
        </p>
      </div>
    </div>
  );
};

export default BlocksWorld;
