
// Types for the pathfinder grid
export type CellType = 'empty' | 'wall' | 'start' | 'end';

export interface Cell {
  row: number;
  col: number;
  type: CellType;
}

export type GridState = Cell[][];

// Create an empty grid of the specified size
export const createEmptyGrid = (rows: number, cols: number): GridState => {
  const grid: GridState = [];
  
  for (let i = 0; i < rows; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        row: i,
        col: j,
        type: 'empty'
      });
    }
    grid.push(row);
  }
  
  return grid;
};

// Find the start and end cells in a grid
export const findSpecialCells = (grid: GridState): { start: Cell | null; end: Cell | null } => {
  let start: Cell | null = null;
  let end: Cell | null = null;
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col];
      if (cell.type === 'start') start = cell;
      if (cell.type === 'end') end = cell;
    }
  }
  
  return { start, end };
};

// Get neighbors of a cell (4-way: up, right, down, left)
export const getNeighbors = (grid: GridState, cell: Cell): Cell[] => {
  const neighbors: Cell[] = [];
  const { row, col } = cell;
  const directions = [
    [-1, 0],  // up
    [0, 1],   // right
    [1, 0],   // down
    [0, -1]   // left
  ];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    // Check if the new position is within bounds
    if (newRow >= 0 && newRow < grid.length && 
        newCol >= 0 && newCol < grid[0].length) {
      const neighbor = grid[newRow][newCol];
      
      // Only include non-wall cells
      if (neighbor.type !== 'wall') {
        neighbors.push(neighbor);
      }
    }
  }
  
  return neighbors;
};

// Check if two cells are adjacent (share a side)
export const areAdjacent = (cell1: Cell, cell2: Cell): boolean => {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);
  
  // Cells are adjacent if they share a side (not diagonally)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// Check if a path is valid (continuous and doesn't go through walls)
export const isValidPath = (grid: GridState, path: Cell[]): boolean => {
  // Check if path has at least 2 cells
  if (path.length < 2) {
    return false;
  }
  
  // Check if all cells in the path are adjacent
  for (let i = 0; i < path.length - 1; i++) {
    if (!areAdjacent(path[i], path[i + 1])) {
      return false;
    }
  }
  
  // Check if any cell in the path is a wall
  for (let i = 0; i < path.length; i++) {
    const { row, col } = path[i];
    if (grid[row][col].type === 'wall') {
      return false;
    }
  }
  
  return true;
};

// BFS pathfinding algorithm
export const findPathBFS = (grid: GridState, start: Cell, end: Cell): Cell[] | null => {
  // Queue for BFS
  const queue: Cell[] = [start];
  
  // Keep track of visited cells and their previous cell
  const visited = new Set<string>();
  const prev = new Map<string, Cell>();
  
  const cellToString = (cell: Cell): string => `${cell.row},${cell.col}`;
  
  visited.add(cellToString(start));
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Check if we reached the end
    if (current.row === end.row && current.col === end.col) {
      // Reconstruct the path
      const path: Cell[] = [];
      let curr = current;
      
      while (curr.row !== start.row || curr.col !== start.col) {
        path.unshift(curr);
        curr = prev.get(cellToString(curr))!;
      }
      
      path.unshift(start);
      return path;
    }
    
    // Check all neighbors
    for (const neighbor of getNeighbors(grid, current)) {
      const neighborStr = cellToString(neighbor);
      
      if (!visited.has(neighborStr)) {
        visited.add(neighborStr);
        prev.set(neighborStr, current);
        queue.push(neighbor);
      }
    }
  }
  
  // No path found
  return null;
};

// Find all reachable cells from start (for visualization)
export const findAllReachable = (grid: GridState, start: Cell): Set<string> => {
  const queue: Cell[] = [start];
  const visited = new Set<string>();
  
  const cellToString = (cell: Cell): string => `${cell.row},${cell.col}`;
  visited.add(cellToString(start));
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    for (const neighbor of getNeighbors(grid, current)) {
      const neighborStr = cellToString(neighbor);
      
      if (!visited.has(neighborStr)) {
        visited.add(neighborStr);
        queue.push(neighbor);
      }
    }
  }
  
  return visited;
};

// Generate a random maze
export const generateRandomMaze = (
  rows: number, 
  cols: number, 
  wallProbability: number = 0.3
): GridState => {
  const grid = createEmptyGrid(rows, cols);
  
  // Add random walls
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (Math.random() < wallProbability) {
        grid[i][j].type = 'wall';
      }
    }
  }
  
  // Place start and end points
  // Start in top-left quadrant
  const startRow = Math.floor(Math.random() * (rows / 2));
  const startCol = Math.floor(Math.random() * (cols / 2));
  grid[startRow][startCol].type = 'start';
  
  // End in bottom-right quadrant
  const endRow = Math.floor(rows / 2) + Math.floor(Math.random() * (rows / 2));
  const endCol = Math.floor(cols / 2) + Math.floor(Math.random() * (cols / 2));
  grid[endRow][endCol].type = 'end';
  
  return grid;
};

// Generate a maze that is guaranteed to have a path
export const generateMazeWithPath = (
  rows: number, 
  cols: number, 
  wallProbability: number = 0.3
): GridState => {
  let attempts = 0;
  let grid: GridState;
  let start: Cell | null;
  let end: Cell | null;
  let path: Cell[] | null;
  
  // Try to generate a maze with a valid path
  do {
    grid = generateRandomMaze(rows, cols, wallProbability);
    const specialCells = findSpecialCells(grid);
    start = specialCells.start;
    end = specialCells.end;
    
    if (start && end) {
      path = findPathBFS(grid, start, end);
    } else {
      path = null;
    }
    
    attempts++;
  } while (!path && attempts < 100);
  
  return grid;
};

// Get an alternative path by temporarily blocking the optimal path
export const findAlternativePath = (grid: GridState, originalPath: Cell[]): Cell[] | null => {
  // Create a deep copy of the grid
  const tempGrid: GridState = JSON.parse(JSON.stringify(grid));
  
  // Block the middle of the original path to force an alternative
  const pathsToBlock = Math.min(3, Math.floor(originalPath.length / 3));
  
  // Skip the start and end cells
  for (let i = 1; i < pathsToBlock + 1; i++) {
    const index = Math.floor((originalPath.length - 2) * i / (pathsToBlock + 1)) + 1;
    const cell = originalPath[index];
    if (cell && tempGrid[cell.row][cell.col].type !== 'start' && tempGrid[cell.row][cell.col].type !== 'end') {
      tempGrid[cell.row][cell.col].type = 'wall';
    }
  }
  
  // Find a new path
  const { start, end } = findSpecialCells(tempGrid);
  if (start && end) {
    return findPathBFS(tempGrid, start, end);
  }
  
  return null;
};
