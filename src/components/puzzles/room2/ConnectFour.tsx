
import React, { useState, useEffect } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, Brain, Trophy, AlertTriangle, Cpu } from 'lucide-react';
import {
  Board,
  Player,
  PLAYER_HUMAN,
  PLAYER_AI,
  createEmptyBoard,
  makeMove,
  getNextAvailableRow,
  checkWinner,
  isBoardFull,
  getBestMove
} from '@/utils/connectFourUtils';

const ConnectFour = () => {
  const { updatePuzzleStatus } = useGameState();
  
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER_HUMAN);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [playerWins, setPlayerWins] = useState<number>(0);
  const [aiWins, setAiWins] = useState<number>(0);
  const [draws, setDraws] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [hoverColumn, setHoverColumn] = useState<number | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  
  // Effect to handle AI moves
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (currentPlayer === PLAYER_AI && !gameOver) {
      setIsAiThinking(true);
      
      // Add a slight delay to simulate AI "thinking"
      timeoutId = setTimeout(() => {
        const aiMove = getBestMove(board, difficulty);
        handleMove(aiMove);
        setIsAiThinking(false);
      }, 800);
    }
    
    return () => clearTimeout(timeoutId);
  }, [currentPlayer, board, gameOver]);
  
  // Update room status when player wins twice
  useEffect(() => {
    if (playerWins >= 2) {
      updatePuzzleStatus('room2', 'connect4', true);
      toast.success("You've beaten the AI twice! Room 2 complete!");
    }
  }, [playerWins, updatePuzzleStatus]);
  
  // Handle a move (by human or AI)
  const handleMove = (col: number) => {
    if (gameOver || isAiThinking) return;
    
    const row = getNextAvailableRow(board, col);
    if (row === null) return; // Column is full
    
    // Make the move
    const newBoard = makeMove(board, col, currentPlayer);
    setBoard(newBoard);
    
    // Check if the current player has won
    if (checkWinner(newBoard, currentPlayer)) {
      setGameOver(true);
      setWinner(currentPlayer);
      
      if (currentPlayer === PLAYER_HUMAN) {
        setPlayerWins(prev => prev + 1);
        toast.success("You win! Well done!");
      } else {
        setAiWins(prev => prev + 1);
        toast.error("AI wins this round. Try again!");
      }
      
      return;
    }
    
    // Check if the board is full (draw)
    if (isBoardFull(newBoard)) {
      setGameOver(true);
      setWinner(null);
      setDraws(prev => prev + 1);
      toast.info("It's a draw!");
      return;
    }
    
    // Switch players
    setCurrentPlayer(currentPlayer === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN);
  };
  
  // Handle human player move
  const handleColumnClick = (col: number) => {
    if (currentPlayer === PLAYER_HUMAN && !gameOver && !isAiThinking) {
      handleMove(col);
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER_HUMAN);
    setGameOver(false);
    setWinner(null);
    setHoverColumn(null);
  };
  
  // Reset all stats
  const resetStats = () => {
    setPlayerWins(0);
    setAiWins(0);
    setDraws(0);
    resetGame();
  };
  
  // Render a cell
  const renderCell = (rowIndex: number, colIndex: number) => {
    const cellValue = board[rowIndex][colIndex];
    
    let className = "connect-cell";
    if (cellValue === PLAYER_HUMAN) {
      className += " connect-cell-yellow";
    } else if (cellValue === PLAYER_AI) {
      className += " connect-cell-red";
    }
    
    return <div key={`${rowIndex}-${colIndex}`} className={className}></div>;
  };
  
  // Render the column hover indicator
  const renderColumnIndicator = (colIndex: number) => {
    let className = "connect-indicator";
    
    // Highlight on hover
    if (hoverColumn === colIndex && currentPlayer === PLAYER_HUMAN && !gameOver && !isAiThinking) {
      className += " connect-indicator-active";
    }
    
    return <div key={`indicator-${colIndex}`} className={className}></div>;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-mono font-bold text-primary glow mb-2">
          Connect Four vs AI
        </h2>
        <p className="text-muted-foreground mb-4">
          Beat the minimax algorithm twice to complete the room
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {/* Difficulty Selection */}
          <Select
            value={difficulty}
            onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          
          {/* New Game Button */}
          <Button
            variant="outline"
            onClick={resetGame}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            New Game
          </Button>
          
          {/* Reset Stats Button */}
          <Button
            variant="outline"
            onClick={resetStats}
          >
            Reset Stats
          </Button>
        </div>
        
        {/* Game Status */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            You: {playerWins}
          </Badge>
          
          <Badge variant="outline" className="bg-red-500/20 text-red-500 flex items-center gap-1">
            <Cpu className="h-4 w-4" />
            AI: {aiWins}
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            Draws: {draws}
          </Badge>
        </div>
        
        {/* Current Player & Game Status */}
        {!gameOver ? (
          <Badge variant={currentPlayer === PLAYER_HUMAN ? "default" : "destructive"} className="mb-4">
            {currentPlayer === PLAYER_HUMAN 
              ? "Your Turn (Yellow)" 
              : isAiThinking 
                ? "AI Thinking..." 
                : "AI's Turn (Red)"}
          </Badge>
        ) : (
          <Badge variant={winner === PLAYER_HUMAN ? "secondary" : winner === PLAYER_AI ? "destructive" : "outline"} className="mb-4">
            {winner === PLAYER_HUMAN 
              ? "You Win!" 
              : winner === PLAYER_AI 
                ? "AI Wins!" 
                : "Draw!"}
          </Badge>
        )}
        
        {playerWins >= 2 && (
          <div className="mb-4">
            <Badge variant="secondary" className="bg-accent/20 text-accent animate-pulse">
              Room 2 Complete! Room 3 Unlocked!
            </Badge>
          </div>
        )}
      </div>
      
      {/* Game Board */}
      <div className="flex justify-center mb-8">
        <div>
          {/* Column Indicators (top row) */}
          <div className="connect-grid mb-1" style={{ gridTemplateRows: "auto" }}>
            {Array(7).fill(null).map((_, colIndex) => (
              renderColumnIndicator(colIndex)
            ))}
          </div>
          
          {/* Game Board */}
          <div 
            className="connect-grid rounded-md overflow-hidden"
            onMouseLeave={() => setHoverColumn(null)}
          >
            {board.map((row, rowIndex) => (
              row.map((_, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onMouseEnter={() => setHoverColumn(colIndex)}
                  onClick={() => handleColumnClick(colIndex)}
                >
                  {renderCell(rowIndex, colIndex)}
                </div>
              ))
            ))}
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="mt-8 p-4 bg-muted rounded-md">
        <h3 className="text-lg font-mono font-bold mb-2">How it works</h3>
        <p className="text-sm mb-2">
          This Connect Four game uses the minimax algorithm with alpha-beta pruning to make
          intelligent decisions. The AI evaluates all possible moves and their future consequences,
          similar to how chess AI works.
        </p>
        <p className="text-sm">
          The minimax algorithm looks ahead multiple moves (more on higher difficulty levels) to
          find the best move considering that both players will play optimally. Alpha-beta pruning
          is an optimization technique that reduces the number of nodes to evaluate.
        </p>
      </div>
    </div>
  );
};

export default ConnectFour;
