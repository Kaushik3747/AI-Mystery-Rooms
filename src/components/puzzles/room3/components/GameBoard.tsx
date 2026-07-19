
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BlocksWorldState } from '@/utils/blocksWorldUtils';
import StackComponent from './StackComponent';

interface GameBoardProps {
  currentState: BlocksWorldState;
  goalState: BlocksWorldState;
  selectedBlock: { blockId: string; stackIdx: number } | null;
  handleBlockClick: (blockId: string, stackIdx: number) => void;
  handleStackClick: (stackIdx: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  currentState,
  goalState,
  selectedBlock,
  handleBlockClick,
  handleStackClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Current State */}
      <Card className="border border-primary">
        <CardHeader>
          <CardTitle className="text-center font-mono">Current State</CardTitle>
          <CardDescription className="text-center">
            {selectedBlock ? 'Select a stack to place the block' : 'Click a block to move it'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blocks-container h-48">
            {currentState.stacks.map((stack, idx) => (
              <StackComponent
                key={`current-stack-${idx}`}
                stack={stack.blocks}
                stackIdx={idx}
                selectedBlockId={selectedBlock?.blockId || null}
                onBlockClick={handleBlockClick}
                onStackClick={handleStackClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Goal State */}
      <Card className="border border-accent">
        <CardHeader>
          <CardTitle className="text-center font-mono">Goal State</CardTitle>
          <CardDescription className="text-center">
            Rearrange the blocks to match this configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="blocks-container h-48">
            {goalState.stacks.map((stack, idx) => (
              <StackComponent
                key={`goal-stack-${idx}`}
                stack={stack.blocks}
                stackIdx={idx}
                selectedBlockId={null}
                onBlockClick={() => {}} // No interaction with goal state
                onStackClick={() => {}} // No interaction with goal state
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameBoard;
