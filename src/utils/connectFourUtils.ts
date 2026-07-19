
// Type definitions for Connect Four game
export type Player = 1 | 2;  // Player 1 (Human) or 2 (AI)
export type Cell = Player | null;  // A cell can be empty or occupied by a player
export type Board = Cell[][];  // 6 rows x 7 columns board

// Constants
export const ROWS = 6;
export const COLS = 7;
export const PLAYER_HUMAN = 1;
export const PLAYER_AI = 2;
export const CONNECT_N = 4;  // Number of pieces in a row to win

// Create an empty board
export const createEmptyBoard = (): Board => {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
};

// Check if a column is full
export const isColumnFull = (board: Board, col: number): boolean => {
  return board[0][col] !== null;
};

// Get the next available row in a column
export const getNextAvailableRow = (board: Board, col: number): number | null => {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      return row;
    }
  }
  return null;  // Column is full
};

// Make a move
export const makeMove = (board: Board, col: number, player: Player): Board => {
  const newBoard = board.map(row => [...row]);
  const row = getNextAvailableRow(newBoard, col);
  
  if (row !== null) {
    newBoard[row][col] = player;
  }
  
  return newBoard;
};

// Check if the board is full
export const isBoardFull = (board: Board): boolean => {
  return board[0].every(cell => cell !== null);
};

// Check if a player has won
export const checkWinner = (board: Board, player: Player): boolean => {
  // Check horizontally
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - CONNECT_N; col++) {
      if (
        board[row][col] === player &&
        board[row][col + 1] === player &&
        board[row][col + 2] === player &&
        board[row][col + 3] === player
      ) {
        return true;
      }
    }
  }
  
  // Check vertically
  for (let row = 0; row <= ROWS - CONNECT_N; row++) {
    for (let col = 0; col < COLS; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col] === player &&
        board[row + 2][col] === player &&
        board[row + 3][col] === player
      ) {
        return true;
      }
    }
  }
  
  // Check diagonally (down-right)
  for (let row = 0; row <= ROWS - CONNECT_N; row++) {
    for (let col = 0; col <= COLS - CONNECT_N; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col + 1] === player &&
        board[row + 2][col + 2] === player &&
        board[row + 3][col + 3] === player
      ) {
        return true;
      }
    }
  }
  
  // Check diagonally (down-left)
  for (let row = 0; row <= ROWS - CONNECT_N; row++) {
    for (let col = CONNECT_N - 1; col < COLS; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col - 1] === player &&
        board[row + 2][col - 2] === player &&
        board[row + 3][col - 3] === player
      ) {
        return true;
      }
    }
  }
  
  return false;
};

// Get all valid moves (non-full columns)
export const getValidMoves = (board: Board): number[] => {
  const validMoves = [];
  
  for (let col = 0; col < COLS; col++) {
    if (!isColumnFull(board, col)) {
      validMoves.push(col);
    }
  }
  
  return validMoves;
};

// Evaluation function for minimax
const evaluateWindow = (window: Cell[], player: Player): number => {
  const opponent = player === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  let score = 0;
  
  // Count pieces
  const playerCount = window.filter(cell => cell === player).length;
  const opponentCount = window.filter(cell => cell === opponent).length;
  const emptyCount = window.filter(cell => cell === null).length;
  
  // Score based on how many pieces in a row
  if (playerCount === 4) {
    score += 100;
  } else if (playerCount === 3 && emptyCount === 1) {
    score += 5;
  } else if (playerCount === 2 && emptyCount === 2) {
    score += 2;
  }
  
  // Penalize opponent's pieces
  if (opponentCount === 3 && emptyCount === 1) {
    score -= 4;
  }
  
  return score;
};

// Evaluate board state for minimax
export const evaluateBoard = (board: Board, player: Player): number => {
  let score = 0;
  const center = Math.floor(COLS / 2);
  
  // Score center column (preferable to control the center)
  const centerArray = [];
  for (let row = 0; row < ROWS; row++) {
    centerArray.push(board[row][center]);
  }
  const centerCount = centerArray.filter(cell => cell === player).length;
  score += centerCount * 3;
  
  // Score horizontal windows
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - CONNECT_N; col++) {
      const window = [
        board[row][col],
        board[row][col + 1],
        board[row][col + 2],
        board[row][col + 3]
      ];
      score += evaluateWindow(window, player);
    }
  }
  
  // Score vertical windows
  for (let row = 0; row <= ROWS - CONNECT_N; row++) {
    for (let col = 0; col < COLS; col++) {
      const window = [
        board[row][col],
        board[row + 1][col],
        board[row + 2][col],
        board[row + 3][col]
      ];
      score += evaluateWindow(window, player);
    }
  }
  
  // Score diagonal (down-right) windows
  for (let row = 0; row <= ROWS - CONNECT_N; row++) {
    for (let col = 0; col <= COLS - CONNECT_N; col++) {
      const window = [
        board[row][col],
        board[row + 1][col + 1],
        board[row + 2][col + 2],
        board[row + 3][col + 3]
      ];
      score += evaluateWindow(window, player);
    }
  }
  
  // Score diagonal (down-left) windows
  for (let row = 0; row <= ROWS - CONNECT_N; row++) {
    for (let col = CONNECT_N - 1; col < COLS; col++) {
      const window = [
        board[row][col],
        board[row + 1][col - 1],
        board[row + 2][col - 2],
        board[row + 3][col - 3]
      ];
      score += evaluateWindow(window, player);
    }
  }
  
  return score;
};

// Is the game over?
export const isGameOver = (board: Board): boolean => {
  return (
    checkWinner(board, PLAYER_HUMAN) ||
    checkWinner(board, PLAYER_AI) ||
    isBoardFull(board)
  );
};

// Minimax algorithm with alpha-beta pruning
export const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): [number, number | null] => {
  const validMoves = getValidMoves(board);
  
  // Check for terminal states
  if (depth === 0 || isGameOver(board)) {
    if (checkWinner(board, PLAYER_AI)) {
      return [10000, null]; // AI wins
    } else if (checkWinner(board, PLAYER_HUMAN)) {
      return [-10000, null]; // Human wins
    } else if (isBoardFull(board)) {
      return [0, null]; // Draw
    } else {
      // Evaluate the board state using heuristics
      return [
        evaluateBoard(board, PLAYER_AI) - evaluateBoard(board, PLAYER_HUMAN),
        null
      ];
    }
  }
  
  let bestCol: number | null = validMoves.length > 0 ? validMoves[0] : null;
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    
    for (const col of validMoves) {
      const row = getNextAvailableRow(board, col);
      if (row !== null) {
        const newBoard = makeMove(board, col, PLAYER_AI);
        const [evalScore] = minimax(newBoard, depth - 1, alpha, beta, false);
        
        if (evalScore > maxEval) {
          maxEval = evalScore;
          bestCol = col;
        }
        
        alpha = Math.max(alpha, maxEval);
        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }
    }
    
    return [maxEval, bestCol];
  } else {
    let minEval = Infinity;
    
    for (const col of validMoves) {
      const row = getNextAvailableRow(board, col);
      if (row !== null) {
        const newBoard = makeMove(board, col, PLAYER_HUMAN);
        const [evalScore] = minimax(newBoard, depth - 1, alpha, beta, true);
        
        if (evalScore < minEval) {
          minEval = evalScore;
          bestCol = col;
        }
        
        beta = Math.min(beta, minEval);
        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }
    }
    
    return [minEval, bestCol];
  }
};

// Get the best move for the AI using minimax
export const getBestMove = (board: Board, difficulty: 'easy' | 'medium' | 'hard'): number => {
  // Set depth based on difficulty
  let depth;
  switch (difficulty) {
    case 'easy':
      depth = 2;
      break;
    case 'medium':
      depth = 4;
      break;
    case 'hard':
      depth = 6;
      break;
    default:
      depth = 4;
  }
  
  // Add some randomness for easy difficulty
  if (difficulty === 'easy' && Math.random() < 0.3) {
    const validMoves = getValidMoves(board);
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  const [_, bestCol] = minimax(board, depth, -Infinity, Infinity, true);
  return bestCol !== null ? bestCol : 0; // Fallback to first column if null
};
