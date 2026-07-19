
import React from 'react';
import { Block } from '@/utils/blocksWorldUtils';

interface BlockComponentProps {
  block: Block;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const BlockComponent: React.FC<BlockComponentProps> = ({ block, isSelected, onClick }) => {
  return (
    <div 
      className={`${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div 
        className="block"
        style={{ backgroundColor: block.color, borderColor: `${block.color}88` }}
      >
        {block.label}
      </div>
    </div>
  );
};

export default BlockComponent;
