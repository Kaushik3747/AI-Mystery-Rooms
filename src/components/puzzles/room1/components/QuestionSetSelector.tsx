
import React from 'react';
import { Button } from '@/components/ui/button';
import { QuestionSet } from '../types/LogicPuzzleTypes';

interface QuestionSetSelectorProps {
  questionSets: QuestionSet[];
  activeSetIndex: number;
  onSetChange: (index: number) => void;
}

const QuestionSetSelector: React.FC<QuestionSetSelectorProps> = ({
  questionSets,
  activeSetIndex,
  onSetChange
}) => {
  return (
    <div className="flex justify-center space-x-3 mb-6">
      {questionSets.map((set, index) => (
        <Button
          key={set.id}
          variant={activeSetIndex === index ? "default" : "outline"}
          className="font-mono"
          onClick={() => onSetChange(index)}
        >
          Set {set.id}: {set.title}
        </Button>
      ))}
    </div>
  );
};

export default QuestionSetSelector;
