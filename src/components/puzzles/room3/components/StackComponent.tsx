
import React from 'react';
import { Block, BlocksWorldState } from '@/utils/blocksWorldUtils';
import BlockComponent from './BlockComponent';

interface StackComponentProps {
  stack: Block[];
  stackIdx: number;
  selectedBlockId: string | null;
  onBlockClick: (blockId: string, stackIdx: number) => void;
  onStackClick: (stackIdx: number) => void;
}

const StackComponent: React.FC<StackComponentProps> = ({ 
  stack, 
  stackIdx, 
  selectedBlockId,
  onBlockClick,
  onStackClick
}) => {
  return (
    <div 
      className="block-stack" 
      onClick={() => onStackClick(stackIdx)}
    >
      <div className="block-table"></div>
      {stack.map((block, blockIdx) => (
        <BlockComponent 
          key={block.id} 
          block={block} 
          isSelected={selectedBlockId === block.id}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onBlockClick(block.id, stackIdx);
          }}
        />
      ))}
    </div>
  );
};

export default StackComponent;
