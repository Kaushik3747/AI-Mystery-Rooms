// Types for the blocks world
export type BlockId = string;

export interface Block {
  id: BlockId;
  label: string;
  color: string;
}

export interface Stack {
  blocks: Block[];
}

// Actions type
export type ActionType = 'move';

export interface Action {
  type: ActionType;
  blockId: BlockId;
  fromStack: number;
  toStack: number;
}

// State of the blocks world
export interface BlocksWorldState {
  stacks: Stack[];
}

// Check if a block is clear (nothing on top)
export const isBlockClear = (state: BlocksWorldState, stackIdx: number, blockIdx: number): boolean => {
  return blockIdx === state.stacks[stackIdx].blocks.length - 1;
};

// Check if a stack exists
export const doesStackExist = (state: BlocksWorldState, stackIdx: number): boolean => {
  return stackIdx >= 0 && stackIdx < state.stacks.length;
};

// Find a block in the state
export const findBlock = (state: BlocksWorldState, blockId: BlockId): { stackIdx: number; blockIdx: number } | null => {
  for (let stackIdx = 0; stackIdx < state.stacks.length; stackIdx++) {
    const stack = state.stacks[stackIdx];
    for (let blockIdx = 0; blockIdx < stack.blocks.length; blockIdx++) {
      if (stack.blocks[blockIdx].id === blockId) {
        return { stackIdx, blockIdx };
      }
    }
  }
  return null;
};

// Check if a move is valid
export const isValidMove = (state: BlocksWorldState, action: Action): boolean => {
  const { blockId, fromStack, toStack } = action;
  
  // Check if both stacks exist
  if (!doesStackExist(state, fromStack) || !doesStackExist(state, toStack)) {
    return false;
  }
  
  // Find the block
  const blockLocation = findBlock(state, blockId);
  if (!blockLocation) {
    return false;
  }
  
  // Check if the block is in the right stack
  if (blockLocation.stackIdx !== fromStack) {
    return false;
  }
  
  // Check if the block is clear (on top of its stack)
  if (!isBlockClear(state, fromStack, blockLocation.blockIdx)) {
    return false;
  }
  
  return true;
};

// Apply a move to the state
export const applyMove = (state: BlocksWorldState, action: Action): BlocksWorldState => {
  if (!isValidMove(state, action)) {
    return state;
  }
  
  const { blockId, fromStack, toStack } = action;
  const newState: BlocksWorldState = JSON.parse(JSON.stringify(state));
  
  // Find the block and remove it from its stack
  const blockLocation = findBlock(newState, blockId)!;
  const block = newState.stacks[fromStack].blocks.pop()!;
  
  // Add the block to the new stack
  newState.stacks[toStack].blocks.push(block);
  
  return newState;
};

// Check if two states are equal
export const areStatesEqual = (state1: BlocksWorldState, state2: BlocksWorldState): boolean => {
  if (state1.stacks.length !== state2.stacks.length) {
    return false;
  }
  
  for (let i = 0; i < state1.stacks.length; i++) {
    const stack1 = state1.stacks[i];
    const stack2 = state2.stacks[i];
    
    if (stack1.blocks.length !== stack2.blocks.length) {
      return false;
    }
    
    for (let j = 0; j < stack1.blocks.length; j++) {
      if (stack1.blocks[j].id !== stack2.blocks[j].id) {
        return false;
      }
    }
  }
  
  return true;
};

// Heuristic function for A* search: number of blocks in wrong positions
export const heuristic = (currentState: BlocksWorldState, goalState: BlocksWorldState): number => {
  let misplaced = 0;
  
  // For each block in the goal state, check if it's in the right position in the current state
  for (let stackIdx = 0; stackIdx < goalState.stacks.length; stackIdx++) {
    const goalStack = goalState.stacks[stackIdx];
    for (let blockIdx = 0; blockIdx < goalStack.blocks.length; blockIdx++) {
      const blockId = goalStack.blocks[blockIdx].id;
      
      // Find the block in the current state
      const currentPos = findBlock(currentState, blockId);
      if (!currentPos || currentPos.stackIdx !== stackIdx || 
          currentState.stacks[currentPos.stackIdx].blocks[blockIdx]?.id !== blockId) {
        misplaced++;
      }
    }
  }
  
  return misplaced;
};

// A* search algorithm for optimal planning
export const findPlan = (
  initialState: BlocksWorldState, 
  goalState: BlocksWorldState, 
  maxSteps: number = 100
): Action[] => {
  // Priority queue for A* search
  const openSet: {
    state: BlocksWorldState;
    actions: Action[];
    cost: number;
    priority: number;
  }[] = [
    {
      state: initialState,
      actions: [],
      cost: 0,
      priority: heuristic(initialState, goalState)
    }
  ];
  
  // Keep track of visited states to avoid cycles
  const visited = new Set<string>();
  const stateToString = (state: BlocksWorldState): string => JSON.stringify(state);
  
  while (openSet.length > 0 && openSet[0].actions.length < maxSteps) {
    // Get the node with lowest priority (f = g + h)
    openSet.sort((a, b) => a.priority - b.priority);
    const current = openSet.shift()!;
    
    // Check if we reached the goal
    if (areStatesEqual(current.state, goalState)) {
      return current.actions;
    }
    
    // Mark this state as visited
    visited.add(stateToString(current.state));
    
    // Generate all possible moves
    for (let fromStack = 0; fromStack < current.state.stacks.length; fromStack++) {
      const stack = current.state.stacks[fromStack];
      if (stack.blocks.length === 0) continue;
      
      // Get the top block
      const topBlock = stack.blocks[stack.blocks.length - 1];
      
      // Try moving it to each other stack
      for (let toStack = 0; toStack < current.state.stacks.length; toStack++) {
        if (fromStack === toStack) continue;
        
        const action: Action = {
          type: 'move',
          blockId: topBlock.id,
          fromStack,
          toStack
        };
        
        // Apply the move
        const newState = applyMove(current.state, action);
        
        // Check if this is a new state
        const stateStr = stateToString(newState);
        if (!visited.has(stateStr)) {
          // Create a new node
          const newCost = current.cost + 1;
          const newPriority = newCost + heuristic(newState, goalState);
          
          openSet.push({
            state: newState,
            actions: [...current.actions, action],
            cost: newCost,
            priority: newPriority
          });
        }
      }
    }
  }
  
  // No solution found within the step limit
  return [];
};

// Create initial and goal states randomly
export const createRandomBlocksWorldProblem = (
  numBlocks: number = 5,
  numStacks: number = 4,
  colors: string[] = ['#ff5757', '#5fb0ff', '#9c57ff', '#ffbd59', '#57ff8f']
): { initialState: BlocksWorldState; goalState: BlocksWorldState } => {
  // Create blocks
  const blocks: Block[] = Array(numBlocks).fill(null).map((_, idx) => ({
    id: `block-${idx + 1}`,
    label: `${idx + 1}`,
    color: colors[idx % colors.length]
  }));
  
  // Helper to shuffle array
  const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Create initial state with random block distribution
  const initialState: BlocksWorldState = {
    stacks: Array(numStacks).fill(null).map(() => ({ blocks: [] }))
  };
  
  // Distribute blocks randomly in the initial state
  const shuffledBlocks = shuffle([...blocks]);
  for (let i = 0; i < shuffledBlocks.length; i++) {
    const stackIdx = Math.floor(Math.random() * numStacks);
    initialState.stacks[stackIdx].blocks.push(shuffledBlocks[i]);
  }
  
  // Create goal state (different from initial)
  let goalState: BlocksWorldState;
  do {
    goalState = {
      stacks: Array(numStacks).fill(null).map(() => ({ blocks: [] }))
    };
    
    // Distribute blocks randomly in the goal state
    const shuffledGoalBlocks = shuffle([...blocks]);
    for (let i = 0; i < shuffledGoalBlocks.length; i++) {
      const stackIdx = Math.floor(Math.random() * numStacks);
      goalState.stacks[stackIdx].blocks.push(shuffledGoalBlocks[i]);
    }
  } while (areStatesEqual(initialState, goalState));
  
  return { initialState, goalState };
};

// Calculate the score based on number of moves and time taken
export const calculateScore = (numMoves: number, optimalMoves: number, timeTaken: number): number => {
  // Base score: 1000 points
  let score = 1000;
  
  // Deduct points for extra moves beyond optimal
  if (numMoves > optimalMoves) {
    score -= (numMoves - optimalMoves) * 50;
  }
  
  // Deduct points for time taken (1 point per second)
  score -= Math.floor(timeTaken / 1000);
  
  // Ensure score doesn't go below zero
  return Math.max(0, score);
};
