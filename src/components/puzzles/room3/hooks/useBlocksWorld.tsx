
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  BlocksWorldState,
  Block,
  Action,
  createRandomBlocksWorldProblem,
  findPlan,
  isValidMove,
  applyMove,
  areStatesEqual,
  calculateScore
} from '@/utils/blocksWorldUtils';

interface UseBlocksWorldReturn {
  // Game states
  initialState: BlocksWorldState | null;
  currentState: BlocksWorldState | null;
  goalState: BlocksWorldState | null;
  optimalPlan: Action[];
  
  // Game mechanics
  selectedBlock: { blockId: string; stackIdx: number } | null;
  moves: number;
  gameStarted: boolean;
  gameCompleted: boolean;
  puzzle: number;
  score: number;
  totalScore: number;
  
  // Timer state
  elapsedTime: number;
  
  // Methods
  generatePuzzle: () => void;
  handleBlockClick: (blockId: string, stackIdx: number) => void;
  nextPuzzle: () => void;
  formatTime: (ms: number) => string;
  handleStackClick: (stackIdx: number) => void;
}

// Maximum points per puzzle
const MAX_POINTS_PER_PUZZLE = 1000;
// Points deducted per extra move
const POINTS_DEDUCTION_PER_EXTRA_MOVE = 100;

export const useBlocksWorld = (onComplete: (puzzleId: string, status: boolean) => void): UseBlocksWorldReturn => {
  // Game states
  const [initialState, setInitialState] = useState<BlocksWorldState | null>(null);
  const [currentState, setCurrentState] = useState<BlocksWorldState | null>(null);
  const [goalState, setGoalState] = useState<BlocksWorldState | null>(null);
  const [optimalPlan, setOptimalPlan] = useState<Action[]>([]);
  
  // Game mechanics
  const [selectedBlock, setSelectedBlock] = useState<{ blockId: string; stackIdx: number } | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [puzzle, setPuzzle] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  
  // Timer state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a new puzzle
  const generatePuzzle = () => {
    try {
      // Generate random problem
      const { initialState: newInitial, goalState: newGoal } = createRandomBlocksWorldProblem(
        5, // Number of blocks
        4  // Number of stacks
      );
      
      setInitialState(newInitial);
      setCurrentState(newInitial);
      setGoalState(newGoal);
      
      // Calculate optimal solution
      const plan = findPlan(newInitial, newGoal);
      console.log("Generated optimal plan:", plan); // Debug log
      setOptimalPlan(plan);
      
      // Reset game state
      setSelectedBlock(null);
      setMoves(0);
      setGameStarted(false);
      setGameCompleted(false);
      setElapsedTime(0);
      setStartTime(null);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
    } catch (error) {
      console.error('Error generating puzzle:', error);
      toast.error('Failed to generate puzzle. Please try again.');
    }
  };
  
  // Initialize the puzzle
  useEffect(() => {
    generatePuzzle();
  }, [puzzle]);
  
  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted && startTime !== null) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameCompleted, startTime]);
  
  // Format time as mm:ss.ms
  const formatTime = (ms: number): string => {
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Handle stack click for moving a selected block to a stack
  const handleStackClick = (stackIdx: number) => {
    if (selectedBlock) {
      handleBlockClick(selectedBlock.blockId, stackIdx);
    }
  };
  
  // Calculate score based on moves and optimal plan
  const calculateRoundScore = (moves: number, optimalPlanLength: number): number => {
    const extraMoves = Math.max(0, moves - optimalPlanLength);
    const deduction = extraMoves * POINTS_DEDUCTION_PER_EXTRA_MOVE;
    return Math.max(0, MAX_POINTS_PER_PUZZLE - deduction);
  };
  
  // Handle block click
  const handleBlockClick = (blockId: string, stackIdx: number) => {
    if (gameCompleted) return;
    
    // Start the game timer on first move
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }
    
    if (selectedBlock) {
      // If a block is already selected, try to move it
      if (selectedBlock.stackIdx !== stackIdx) {
        const action: Action = {
          type: 'move',
          blockId: selectedBlock.blockId,
          fromStack: selectedBlock.stackIdx,
          toStack: stackIdx
        };
        
        if (currentState && isValidMove(currentState, action)) {
          const newState = applyMove(currentState, action);
          setCurrentState(newState);
          setMoves(moves + 1);
          
          // Check if the goal is reached
          if (goalState && areStatesEqual(newState, goalState)) {
            setGameCompleted(true);
            
            // Calculate score based on moves compared to optimal solution
            const roundScore = calculateRoundScore(moves + 1, optimalPlan.length);
            setScore(roundScore);
            
            // Update total score
            const newTotalScore = totalScore + roundScore;
            setTotalScore(newTotalScore);
            
            toast.success(`Goal reached! Round score: ${roundScore} points`);
            
            // If this is the third puzzle, check if the player has enough points to complete the room
            if (puzzle >= 3) {
              onComplete("puzzle" + puzzle, true);
              if (newTotalScore >= 2500) {
                toast.success('Room 3 completed! You have escaped the AI Escape Room!');
              } else {
                toast.warning(`You need at least 2500 points to escape. Current: ${newTotalScore}. Retry to improve your score!`);
              }
            }
          }
        } else {
          toast.error('Invalid move!');
        }
      }
      
      // Clear selection
      setSelectedBlock(null);
    } else {
      // Select the block if it's on top of its stack
      const state = currentState as BlocksWorldState;
      const stack = state.stacks[stackIdx];
      const topBlockIdx = stack.blocks.length - 1;
      
      if (topBlockIdx >= 0 && stack.blocks[topBlockIdx].id === blockId) {
        setSelectedBlock({ blockId, stackIdx });
      } else {
        toast.error('You can only move blocks that are on top of a stack!');
      }
    }
  };
  
  // Move to next puzzle
  const nextPuzzle = () => {
    setPuzzle(prev => prev + 1);
  };

  return {
    // Game states
    initialState,
    currentState,
    goalState,
    optimalPlan,
    
    // Game mechanics
    selectedBlock,
    moves,
    gameStarted,
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
  };
};
