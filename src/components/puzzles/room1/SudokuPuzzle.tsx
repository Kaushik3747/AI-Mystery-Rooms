
import React, { useState, useEffect } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  SudokuBoard,
  SudokuDifficulty,
  generateSudoku,
  copyBoard,
  isBoardValid,
  isBoardComplete,
  solveSudoku
} from '@/utils/sudokuUtils';

const SudokuPuzzle = () => {
  const { updatePuzzleStatus } = useGameState();
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [initialBoard, setInitialBoard] = useState<SudokuBoard | null>(null);
  const [board, setBoard] = useState<SudokuBoard | null>(null);
  const [solution, setSolution] = useState<SudokuBoard | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [completed, setCompleted] = useState(false);

  // Generate a new puzzle
  const generatePuzzle = () => {
    try {
      const [puzzle, complete] = generateSudoku(difficulty);
      setInitialBoard(copyBoard(puzzle));
      setBoard(copyBoard(puzzle));
      setSolution(copyBoard(complete));
      setSelectedCell(null);
      setIsValid(true);
      setCompleted(false);
    } catch (error) {
      console.error('Error generating puzzle:', error);
      toast.error('Failed to generate puzzle. Please try again.');
    }
  };

  // Initialize the puzzle
  useEffect(() => {
    generatePuzzle();
  }, [difficulty]);

  // Check if the cell is part of the initial board
  const isFixedCell = (row: number, col: number) => {
    if (!initialBoard) return false;
    return initialBoard[row][col] !== null;
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // Don't allow selecting fixed cells
    if (isFixedCell(row, col) || completed) return;
    setSelectedCell([row, col]);
  };

  // Handle number input
  const handleNumberInput = (value: number | null) => {
    if (!selectedCell || !board || completed) return;
    
    const [row, col] = selectedCell;
    const newBoard = board.map(boardRow => [...boardRow]);
    newBoard[row][col] = value;
    setBoard(newBoard);
    
    // Check if board is still valid
    const valid = isBoardValid(newBoard);
    setIsValid(valid);
    
    // Check if board is complete
    const complete = isBoardComplete(newBoard) && valid;
    if (complete) {
      setCompleted(true);
      toast.success('Congratulations! You solved the puzzle!');
      updatePuzzleStatus('room1', 'sudoku', true);
    }
  };

  // Show solution
  const showSolution = () => {
    if (solution) {
      setBoard(copyBoard(solution));
      setCompleted(true);
      toast('Solution shown', {
        description: 'The puzzle solution has been revealed.'
      });
    }
  };

  // Reset the puzzle
  const resetPuzzle = () => {
    if (initialBoard) {
      setBoard(copyBoard(initialBoard));
      setSelectedCell(null);
      setIsValid(true);
      setCompleted(false);
    }
  };

  // Get cell class name based on state
  const getCellClassName = (row: number, col: number) => {
    let className = "sudoku-cell";
    
    // Fixed cell
    if (isFixedCell(row, col)) {
      className += " sudoku-cell-fixed";
    } else {
      className += " sudoku-cell-input";
    }
    
    // Selected cell
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      className += " bg-primary/20 border-primary";
    }
    
    // 3x3 grid borders
    if ((col + 1) % 3 === 0 && col < 8) className += " border-r-2 border-r-primary/50";
    if ((row + 1) % 3 === 0 && row < 8) className += " border-b-2 border-b-primary/50";
    
    return className;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-mono font-bold text-primary glow mb-2">Neural Network Sudoku</h2>
        <p className="text-muted-foreground mb-4">
          Solve the Sudoku puzzle using constraint satisfaction techniques
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Select
            value={difficulty}
            onValueChange={(value) => setDifficulty(value as SudokuDifficulty)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={generatePuzzle}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            New Puzzle
          </Button>
          
          <Button
            variant="outline"
            onClick={resetPuzzle}
          >
            Reset
          </Button>
          
          <Button
            variant="secondary"
            onClick={showSolution}
          >
            Show Solution
          </Button>
        </div>
        
        <div className="flex justify-center items-center space-x-2 mb-4">
          {isValid ? (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <CheckCircle className="h-4 w-4 mr-1" /> Valid
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4 mr-1" /> Invalid
            </Badge>
          )}
          
          {completed && (
            <Badge variant="secondary">
              <CheckCircle className="h-4 w-4 mr-1" /> Completed
            </Badge>
          )}
        </div>
      </div>
      
      {board && (
        <div className="grid place-items-center">
          <div className="sudoku-grid bg-card p-2 rounded-md border border-border">
            {board.map((row, rowIndex) => (
              row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClassName(rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {value !== null ? value : ''}
                </div>
              ))
            ))}
          </div>
          
          {!completed && (
            <div className="mt-6 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  onClick={() => handleNumberInput(num)}
                  disabled={!selectedCell}
                  className="w-10 h-10 p-0 font-bold"
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => handleNumberInput(null)}
                disabled={!selectedCell}
                className="w-10 h-10 p-0"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-muted rounded-md">
        <h3 className="text-lg font-mono font-bold mb-2">How it works</h3>
        <p className="text-sm mb-2">
          This puzzle uses a constraint satisfaction algorithm similar to those used in AI systems.
          Each cell must contain a number from 1-9, with no repeats in any row, column, or 3x3 box.
        </p>
        <p className="text-sm">
          The algorithm that solves Sudoku puzzles uses backtracking to try different values
          until all constraints are satisfied. This is like how neural networks learn by
          adjusting weights until constraints are met.
        </p>
      </div>
    </div>
  );
};

export default SudokuPuzzle;
