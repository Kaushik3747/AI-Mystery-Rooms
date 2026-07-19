
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Award, Trophy } from 'lucide-react';

interface StatusBadgesProps {
  elapsedTime: number;
  moves: number;
  optimalPlanLength: number;
  gameCompleted: boolean;
  score: number;
  totalScore: number;
  requiredScore: number;
  formatTime: (ms: number) => string;
}

const StatusBadges: React.FC<StatusBadgesProps> = ({
  elapsedTime,
  moves,
  optimalPlanLength,
  gameCompleted,
  score,
  totalScore,
  requiredScore,
  formatTime
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        Time: {formatTime(elapsedTime)}
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-1">
        Moves: {moves} {optimalPlanLength > 0 && `(Optimal: ${optimalPlanLength})`}
      </Badge>
      
      {gameCompleted && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          Round Score: {score}
        </Badge>
      )}
      
      <Badge 
        variant={totalScore >= requiredScore ? "secondary" : "outline"} 
        className={`flex items-center gap-1 ${totalScore >= requiredScore ? "bg-green-500 hover:bg-green-600" : ""}`}
      >
        <Trophy className="h-4 w-4" />
        Total: {totalScore}/{requiredScore}
      </Badge>
    </div>
  );
};

export default StatusBadges;
