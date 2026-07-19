
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Question } from '../types/LogicPuzzleTypes';
import { RefreshCw } from './icons/RefreshCw';

interface LogicQuestionProps {
  question: Question;
  onAnswerSelect: (questionId: number, answer: string) => void;
  onSubmitAnswer: (questionId: number) => void;
  onResetQuestion: (questionId: number) => void;
  showHint: number | null;
  onToggleHint: (questionId: number) => void;
}

const LogicQuestion: React.FC<LogicQuestionProps> = ({
  question,
  onAnswerSelect,
  onSubmitAnswer,
  onResetQuestion,
  showHint,
  onToggleHint
}) => {
  return (
    <Card key={question.id} className={`border ${
      question.answered 
        ? question.selectedAnswer === question.correctAnswer 
          ? "border-accent" 
          : "border-destructive"
        : "border-border"
    }`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-mono">
            Question {question.id}
          </CardTitle>
          {question.answered && question.selectedAnswer === question.correctAnswer && (
            <CheckCircle className="h-5 w-5 text-accent" />
          )}
        </div>
        <CardDescription className="text-base">
          {question.text}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((option) => (
            <Button
              key={option}
              variant={question.selectedAnswer === option ? "default" : "outline"}
              className={`justify-start ${
                question.answered && option === question.correctAnswer
                  ? "border-accent text-accent"
                  : ""
              }`}
              disabled={question.answered}
              onClick={() => onAnswerSelect(question.id, option)}
            >
              {option}
            </Button>
          ))}
        </div>
        
        {showHint === question.id && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <p className="font-mono text-muted-foreground">{question.hint}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleHint(question.id)}
        >
          {showHint === question.id ? "Hide Hint" : "Show Hint"}
        </Button>
        
        {question.answered ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResetQuestion(question.id)}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onSubmitAnswer(question.id)}
            disabled={question.selectedAnswer === null}
            className="flex items-center gap-1"
          >
            Submit Answer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default LogicQuestion;
