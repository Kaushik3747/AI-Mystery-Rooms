
// Sudoku puzzle generator and solver

// Difficulty levels
export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

// Sudoku cell value (1-9 or null for empty)
export type SudokuValue = number | null;

// Sudoku board is a 9x9 grid
export type SudokuBoard = SudokuValue[][];

// Create an empty board
export const createEmptyBoard = (): SudokuBoard => {
  return Array(9).fill(null).map(() => Array(9).fill(null));
};

// Check if a value is valid in a specific position
export const isValid = (board: SudokuBoard, row: number, col: number, value: number): boolean => {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === value) return false;
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === value) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === value) return false;
    }
  }
  
  return true;
};

// Find an empty cell
const findEmpty = (board: SudokuBoard): [number, number] | null => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null) return [i, j];
    }
  }
  return null;
};

// Solve the board using backtracking
export const solveSudoku = (board: SudokuBoard): boolean => {
  const empty = findEmpty(board);
  if (!empty) return true; // No more empty cells, puzzle is solved
  
  const [row, col] = empty;
  
  // Try each number 1-9
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      
      if (solveSudoku(board)) {
        return true;
      }
      
      // If we get here, this value didn't work
      board[row][col] = null;
    }
  }
  
  return false; // Trigger backtracking
};

// Deep copy a board
export const copyBoard = (board: SudokuBoard): SudokuBoard => {
  return board.map(row => [...row]);
};

// Generate a completed Sudoku board
const generateCompleteBoard = (): SudokuBoard => {
  const board = createEmptyBoard();
  solveSudoku(board);
  return board;
};

// Remove cells to create a puzzle with the given difficulty
const removeCells = (board: SudokuBoard, difficulty: SudokuDifficulty): SudokuBoard => {
  const newBoard = copyBoard(board);
  
  // Number of cells to remove based on difficulty
  let cellsToRemove;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 36; // Remove ~40% of cells
      break;
    case 'medium':
      cellsToRemove = 45; // Remove ~50% of cells
      break;
    case 'hard':
      cellsToRemove = 54; // Remove ~60% of cells
      break;
    default:
      cellsToRemove = 40;
  }
  
  const positions = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove cells
  for (let i = 0; i < cellsToRemove; i++) {
    if (i < positions.length) {
      const [row, col] = positions[i];
      newBoard[row][col] = null;
    }
  }
  
  return newBoard;
};

// Generate a Sudoku puzzle with the given difficulty
export const generateSudoku = (difficulty: SudokuDifficulty): [SudokuBoard, SudokuBoard] => {
  const completeBoard = generateCompleteBoard();
  const puzzleBoard = removeCells(completeBoard, difficulty);
  return [puzzleBoard, completeBoard];
};

// Check if the current board state is valid (no conflicts)
export const isBoardValid = (board: SudokuBoard): boolean => {
  // Check each cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      if (value !== null) {
        // Temporarily remove the value to check if it's valid
        board[row][col] = null;
        const valid = isValid(board, row, col, value);
        board[row][col] = value;
        
        if (!valid) return false;
      }
    }
  }
  return true;
};

// Check if the board is completely filled
export const isBoardComplete = (board: SudokuBoard): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) return false;
    }
  }
  return true;
};

// Check if a board is solved (complete and valid)
export const isBoardSolved = (board: SudokuBoard): boolean => {
  return isBoardComplete(board) && isBoardValid(board);
};
