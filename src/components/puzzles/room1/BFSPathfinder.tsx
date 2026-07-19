
import React, { useState, useEffect } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, Navigation, Zap, Lightbulb, Bot, Star } from 'lucide-react';
import {
  GridState,
  Cell,
  CellType,
  createEmptyGrid,
  generateMazeWithPath,
  findPathBFS,
  findSpecialCells,
  findAlternativePath,
  isValidPath
} from '@/utils/pathfinderUtils';

const BFSPathfinder = () => {
  const { updatePuzzleStatus } = useGameState();
  const [gridSize, setGridSize] = useState<string>('10');
  const [wallProbability, setWallProbability] = useState<string>('0.3');
  const [grid, setGrid] = useState<GridState>([]);
  const [path, setPath] = useState<Cell[] | null>(null);
  const [alternativePath, setAlternativePath] = useState<Cell[] | null>(null);
  const [showingAlternative, setShowingAlternative] = useState<boolean>(false);
  const [showingSolution, setShowingSolution] = useState<boolean>(false);
  const [cellMode, setCellMode] = useState<CellType | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  
  // New state for user path finding
  const [userMode, setUserMode] = useState<boolean>(false);
  const [userPath, setUserPath] = useState<Cell[]>([]);
  const [pathBuilding, setPathBuilding] = useState<boolean>(false);
  const [lastClickedCell, setLastClickedCell] = useState<Cell | null>(null);
  const [optimalPathFound, setOptimalPathFound] = useState<boolean>(false);

  // Generate a new maze
  const generateMaze = () => {
    try {
      const size = parseInt(gridSize);
      const probability = parseFloat(wallProbability);
      const newGrid = generateMazeWithPath(size, size, probability);
      setGrid(newGrid);
      setPath(null);
      setAlternativePath(null);
      setShowingAlternative(false);
      setShowingSolution(false);
      setCellMode(null);
      setCompleted(false);
      
      // Reset user path finding
      setUserPath([]);
      setPathBuilding(false);
      setLastClickedCell(null);
      setOptimalPathFound(false);
    } catch (error) {
      console.error('Error generating maze:', error);
      toast.error('Failed to generate maze. Please try again.');
    }
  };

  // Initialize the grid
  useEffect(() => {
    generateMaze();
  }, []);

  // Find a path using AI when requested
  const findPath = () => {
    const { start, end } = findSpecialCells(grid);
    
    if (!start || !end) {
      toast.error('Maze requires both start and end points');
      return;
    }
    
    const foundPath = findPathBFS(grid, start, end);
    
    if (foundPath) {
      setPath(foundPath);
      setShowingSolution(true);
      
      // Also compute an alternative path for the "Show Alternative" button
      const altPath = findAlternativePath(grid, foundPath);
      setAlternativePath(altPath);
      
      if (!completed) {
        setCompleted(true);
        updatePuzzleStatus('room1', 'pathfinder', true);
        toast.success('Path found successfully!');
      }
    } else {
      toast.error('No path exists between start and end points');
    }
  };

  // Toggle between showing the main path and alternative path
  const toggleAlternativePath = () => {
    if (alternativePath) {
      setShowingAlternative(!showingAlternative);
    } else {
      toast.info('No alternative path available');
    }
  };

  // Handle cell click for cell type change or path building
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (showingSolution && !userMode) {
      toast.info('Clear the solution before making changes');
      return;
    }
    
    const clickedCell = grid[rowIndex][colIndex];
    
    // If in path building mode, handle path construction
    if (userMode && pathBuilding) {
      // Only allow clicking on empty cells when building a path
      if (clickedCell.type !== 'empty' && clickedCell.type !== 'end') {
        // Allow clicking on end to complete the path
        if (clickedCell.type !== 'start') {
          toast.error('You can only move through empty cells');
          return;
        }
      }
      
      // Check if we've clicked on the start when we have no path yet
      if (clickedCell.type === 'start' && userPath.length === 0) {
        setUserPath([clickedCell]);
        setLastClickedCell(clickedCell);
        return;
      }
      
      // Check if we've clicked on the end to complete the path
      if (clickedCell.type === 'end' && userPath.length > 0) {
        if (isAdjacent(lastClickedCell, clickedCell)) {
          const newUserPath = [...userPath, clickedCell];
          setUserPath(newUserPath);
          setPathBuilding(false);
          
          // Check if the path is optimal
          const { start, end } = findSpecialCells(grid);
          if (start && end) {
            const optimalPath = findPathBFS(grid, start, end);
            if (optimalPath && newUserPath.length === optimalPath.length) {
              toast.success('Congratulations! You found the optimal path!');
              setOptimalPathFound(true);
              if (!completed) {
                setCompleted(true);
                updatePuzzleStatus('room1', 'pathfinder', true);
              }
            } else if (optimalPath) {
              toast.info('Path complete! Would you like to find the optimal path using AI?', {
                action: {
                  label: 'Find Optimal',
                  onClick: () => findPath(),
                },
                duration: 5000,
              });
            }
          }
        } else {
          toast.error('You can only move to adjacent cells');
        }
        return;
      }
      
      // Don't allow clicking the same cell twice
      if (userPath.some(cell => cell.row === clickedCell.row && cell.col === clickedCell.col)) {
        toast.error('You cannot revisit cells in your path');
        return;
      }
      
      // Check if the clicked cell is adjacent to the last cell in the path
      if (lastClickedCell && isAdjacent(lastClickedCell, clickedCell)) {
        const newUserPath = [...userPath, clickedCell];
        setUserPath(newUserPath);
        setLastClickedCell(clickedCell);
      } else {
        toast.error('You can only move to adjacent cells');
      }
      
      return;
    }
    
    // If not in path building mode, handle cell type changes
    if (!userMode && cellMode) {
      // Create a deep copy of the grid
      const newGrid = JSON.parse(JSON.stringify(grid));
      
      // If selecting start or end, remove any existing ones
      if (cellMode === 'start' || cellMode === 'end') {
        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            if (newGrid[r][c].type === cellMode) {
              newGrid[r][c].type = 'empty';
            }
          }
        }
      }
      
      newGrid[rowIndex][colIndex].type = cellMode;
      setGrid(newGrid);
      
      // Reset user path when changing the grid
      setUserPath([]);
      setPathBuilding(false);
      setLastClickedCell(null);
    }
  };

  // Helper function to check if two cells are adjacent
  const isAdjacent = (cell1: Cell | null, cell2: Cell | null): boolean => {
    if (!cell1 || !cell2) return false;
    
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    
    // Cells are adjacent if they share a side (not diagonally)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  // Start building a user path
  const startUserPath = () => {
    // Check if we have start and end points
    const { start, end } = findSpecialCells(grid);
    
    if (!start || !end) {
      toast.error('Maze requires both start and end points');
      return;
    }
    
    setUserMode(true);
    setPathBuilding(true);
    setUserPath([]);
    setLastClickedCell(null);
    setPath(null);
    setShowingSolution(false);
    setShowingAlternative(false);
    
    toast.info('Click on the start point to begin your path, then trace to the end point');
  };

  // Validate if a user path is valid
  const validateUserPath = () => {
    if (userPath.length < 2) {
      toast.error('Please create a path first');
      return;
    }
    
    const { start, end } = findSpecialCells(grid);
    
    if (!start || !end) {
      toast.error('Maze requires both start and end points');
      return;
    }
    
    // Check if path starts at start and ends at end
    const pathStart = userPath[0];
    const pathEnd = userPath[userPath.length - 1];
    
    if (pathStart.row !== start.row || pathStart.col !== start.col) {
      toast.error('Path must start at the start point');
      return;
    }
    
    if (pathEnd.row !== end.row || pathEnd.col !== end.col) {
      toast.error('Path must end at the end point');
      return;
    }
    
    // Check if path is continuous and doesn't go through walls
    if (!isValidPath(grid, userPath)) {
      toast.error('Invalid path: path must be continuous and cannot go through walls');
      return;
    }
    
    // Compare with optimal path
    const optimalPath = findPathBFS(grid, start, end);
    
    if (optimalPath) {
      if (userPath.length === optimalPath.length) {
        toast.success('Congratulations! Your path is optimal!');
        setOptimalPathFound(true);
        if (!completed) {
          setCompleted(true);
          updatePuzzleStatus('room1', 'pathfinder', true);
        }
      } else {
        toast.warning(`Your path is ${userPath.length - 1} steps. The optimal path is ${optimalPath.length - 1} steps.`);
      }
    }
  };

  // Cancel user path building
  const cancelUserPath = () => {
    setUserMode(false);
    setPathBuilding(false);
    setUserPath([]);
    setLastClickedCell(null);
  };

  // Clear user path
  const clearUserPath = () => {
    setUserPath([]);
    setPathBuilding(false);
    setLastClickedCell(null);
    setOptimalPathFound(false);
  };
  
  // Clear the path solutions
  const clearSolution = () => {
    setPath(null);
    setAlternativePath(null);
    setShowingSolution(false);
    setShowingAlternative(false);
  };

  // Get the class name for a cell based on its state
  const getCellClassName = (cell: Cell) => {
    let className = "maze-cell";
    
    // Basic cell type
    if (cell.type === 'wall') {
      className += " maze-cell-wall";
    } else if (cell.type === 'start') {
      className += " maze-cell-start";
    } else if (cell.type === 'end') {
      className += " maze-cell-end";
    }
    
    // User path highlighting
    if (userMode && userPath.some(p => p.row === cell.row && p.col === cell.col)) {
      if (cell.type !== 'start' && cell.type !== 'end') {
        className += " maze-cell-user-path";
      }
    }
    
    // AI path highlighting
    if (showingSolution && path) {
      const currentPath = showingAlternative && alternativePath ? alternativePath : path;
      
      // Check if the cell is in the path (excluding start and end)
      if (cell.type !== 'start' && cell.type !== 'end' && 
          currentPath.some(p => p.row === cell.row && p.col === cell.col)) {
        className += " maze-cell-path";
      }
    }
    
    return className;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-mono font-bold text-secondary glow-secondary mb-2">
          BFS Pathfinder
        </h2>
        <p className="text-muted-foreground mb-4">
          Find the optimal path through the maze using breadth-first search
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {/* Grid Size Selection */}
          <Select
            value={gridSize}
            onValueChange={setGridSize}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Grid Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 x 8</SelectItem>
              <SelectItem value="10">10 x 10</SelectItem>
              <SelectItem value="12">12 x 12</SelectItem>
              <SelectItem value="15">15 x 15</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Wall Density Selection */}
          <Select
            value={wallProbability}
            onValueChange={setWallProbability}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Wall Density" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.2">Low</SelectItem>
              <SelectItem value="0.3">Medium</SelectItem>
              <SelectItem value="0.4">High</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Generate New Maze Button */}
          <Button
            variant="outline"
            onClick={generateMaze}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            New Maze
          </Button>
        </div>
        
        {/* Mode Switcher */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <Button
            variant={!userMode ? "default" : "outline"}
            onClick={() => {
              setUserMode(false);
              setUserPath([]);
              setPathBuilding(false);
            }}
            className="flex items-center gap-1"
            disabled={pathBuilding}
          >
            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
            Edit Mode
          </Button>
          
          <Button
            variant={userMode ? "default" : "outline"}
            onClick={() => setUserMode(true)}
            className="flex items-center gap-1"
            disabled={pathBuilding}
          >
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            Path Mode
          </Button>
        </div>
        
        {!userMode ? (
          // Cell Type Selection Buttons (only in edit mode)
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Button
              variant={cellMode === 'start' ? "default" : "outline"}
              onClick={() => setCellMode('start')}
              disabled={showingSolution}
              className="flex items-center gap-1"
            >
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              Place Start
            </Button>
            
            <Button
              variant={cellMode === 'end' ? "default" : "outline"}
              onClick={() => setCellMode('end')}
              disabled={showingSolution}
              className="flex items-center gap-1"
            >
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              Place End
            </Button>
            
            <Button
              variant={cellMode === 'wall' ? "default" : "outline"}
              onClick={() => setCellMode('wall')}
              disabled={showingSolution}
              className="flex items-center gap-1"
            >
              <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
              Place Wall
            </Button>
            
            <Button
              variant={cellMode === 'empty' ? "default" : "outline"}
              onClick={() => setCellMode('empty')}
              disabled={showingSolution}
              className="flex items-center gap-1"
            >
              <div className="w-3 h-3 bg-background border border-muted-foreground rounded-full"></div>
              Clear Cell
            </Button>
          </div>
        ) : (
          // Path mode buttons
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {!pathBuilding ? (
              <Button 
                onClick={startUserPath}
                className="flex items-center gap-1"
              >
                <Star className="h-4 w-4" />
                Start Building Path
              </Button>
            ) : (
              <Button 
                variant="destructive"
                onClick={cancelUserPath}
                className="flex items-center gap-1"
              >
                Cancel Path
              </Button>
            )}
            
            {userPath.length > 0 && !pathBuilding && (
              <>
                <Button 
                  variant="secondary"
                  onClick={clearUserPath}
                  className="flex items-center gap-1"
                >
                  Clear Path
                </Button>
                
                {!optimalPathFound && userPath.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={validateUserPath}
                    className="flex items-center gap-1"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Check Path
                  </Button>
                )}
              </>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {/* AI Path Finding Button */}
          <Button
            onClick={findPath}
            className="flex items-center gap-1"
            disabled={pathBuilding}
          >
            <Bot className="h-4 w-4" />
            AI Find Path
          </Button>
          
          {/* Show Alternative Button */}
          <Button
            variant="secondary"
            onClick={toggleAlternativePath}
            disabled={!path || !alternativePath}
            className="flex items-center gap-1"
          >
            <Zap className="h-4 w-4" />
            {showingAlternative ? "Show Original Path" : "Show Alternative Path"}
          </Button>
          
          {/* Clear Solution Button */}
          <Button
            variant="outline"
            onClick={clearSolution}
            disabled={!showingSolution}
          >
            Clear AI Solution
          </Button>
        </div>
        
        {/* Status Badges */}
        {showingSolution && path && (
          <div className="flex justify-center items-center mb-2">
            <Badge variant={showingAlternative ? "secondary" : "default"} className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-1" />
              AI Path: {(showingAlternative && alternativePath ? alternativePath : path).length - 1} steps
            </Badge>
          </div>
        )}
        
        {userPath.length > 1 && !pathBuilding && (
          <div className="flex justify-center items-center mb-2">
            <Badge variant="outline" className="bg-accent/10 text-accent flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Your Path: {userPath.length - 1} steps
            </Badge>
          </div>
        )}
        
        {completed && (
          <Badge variant="outline" className="bg-accent/10 text-accent mb-4">
            Puzzle Completed
          </Badge>
        )}
      </div>
      
      {/* Maze Grid */}
      <div className="flex justify-center mb-6">
        <div className="p-2 bg-card border border-border rounded-md shadow-lg">
          <div 
            className="maze-grid" 
            style={{ 
              gridTemplateColumns: `repeat(${parseInt(gridSize)}, 1fr)`, 
              gridTemplateRows: `repeat(${parseInt(gridSize)}, 1fr)` 
            }}
          >
            {grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClassName(cell)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell.type === 'start' ? 'S' : cell.type === 'end' ? 'E' : ''}
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
          This puzzle uses the Breadth-First Search (BFS) algorithm to find the shortest path
          between two points in a maze. BFS explores all nodes at the present depth before moving
          on to nodes at the next depth level.
        </p>
        <p className="text-sm">
          BFS is guaranteed to find the shortest path in an unweighted graph, making it perfect 
          for maze solving. It works by systematically exploring the maze, layer by layer, until
          it reaches the destination or exhausts all possibilities.
        </p>
      </div>
    </div>
  );
};

export default BFSPathfinder;
