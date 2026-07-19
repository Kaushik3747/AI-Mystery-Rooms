
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Lock, LockKeyhole, Unlock } from 'lucide-react';

interface PasswordSectionProps {
  allQuestionsAnswered: boolean;
  passwordGuess: string;
  onPasswordChange: (value: string) => void;
  onSubmitPassword: () => void;
  passwordSubmitted: boolean;
  isPasswordCorrect: boolean;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({
  allQuestionsAnswered,
  passwordGuess,
  onPasswordChange,
  onSubmitPassword,
  passwordSubmitted,
  isPasswordCorrect
}) => {
  return (
    <Card className={`border ${
      passwordSubmitted
        ? isPasswordCorrect
          ? "border-accent" 
          : "border-destructive"
        : "border-primary"
    } ${allQuestionsAnswered ? "" : "opacity-50"}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-mono">
          <Key className="h-5 w-5" />
          Final Password
        </CardTitle>
        <CardDescription>
          Use the first character from each correct answer to form the password
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-3">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Enter password"
              value={passwordGuess}
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={!allQuestionsAnswered || passwordSubmitted && isPasswordCorrect}
              className="pr-10 font-mono"
              maxLength={3}
            />
            {passwordSubmitted && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isPasswordCorrect ? (
                  <Unlock className="h-5 w-5 text-accent" />
                ) : (
                  <Lock className="h-5 w-5 text-destructive" />
                )}
              </div>
            )}
          </div>
          
          <Button
            onClick={onSubmitPassword}
            disabled={!allQuestionsAnswered || passwordSubmitted && isPasswordCorrect}
            className="flex items-center gap-1"
          >
            <LockKeyhole className="h-4 w-4" />
            Submit
          </Button>
        </div>
        
        {!allQuestionsAnswered && (
          <p className="text-sm text-muted-foreground mt-3">
            Answer all questions correctly to unlock the password submission
          </p>
        )}
        
        {passwordSubmitted && isPasswordCorrect && (
          <div className="mt-4 p-3 bg-accent/10 rounded-md text-center">
            <p className="font-mono text-accent font-bold">Room 1 Complete!</p>
            <p className="text-sm mt-1">You've unlocked Room 2: "Strategic Grid"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PasswordSection;
