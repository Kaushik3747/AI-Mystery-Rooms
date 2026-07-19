
import React from 'react';
import LogicQuestion from './components/LogicQuestion';
import PasswordSection from './components/PasswordSection';
import QuestionSetSelector from './components/QuestionSetSelector';
import HowItWorks from './components/HowItWorks';
import { useLogicPuzzle } from './hooks/useLogicPuzzle';

const LogicPuzzle = () => {
  const {
    questionSets,
    activeSetIndex,
    questions,
    passwordGuess,
    passwordSubmitted,
    showHint,
    allQuestionsAnswered,
    finalPassword,
    changeQuestionSet,
    handleAnswerSelect,
    submitAnswer,
    submitPassword,
    resetQuestion,
    toggleHint,
    setPasswordGuess
  } = useLogicPuzzle();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-mono font-bold text-accent glow-accent mb-2">
          Logic Gate Challenge
        </h2>
        <p className="text-muted-foreground mb-4">
          Solve the logical puzzles to discover the final password
        </p>
      </div>

      {/* Question Set Selection */}
      <QuestionSetSelector
        questionSets={questionSets}
        activeSetIndex={activeSetIndex}
        onSetChange={changeQuestionSet}
      />
      
      {/* Questions Section */}
      <div className="space-y-6 mb-8">
        {questions.map((question) => (
          <LogicQuestion
            key={question.id}
            question={question}
            onAnswerSelect={handleAnswerSelect}
            onSubmitAnswer={submitAnswer}
            onResetQuestion={resetQuestion}
            showHint={showHint}
            onToggleHint={toggleHint}
          />
        ))}
      </div>
      
      {/* Final Password Section */}
      <PasswordSection
        allQuestionsAnswered={allQuestionsAnswered}
        passwordGuess={passwordGuess}
        onPasswordChange={setPasswordGuess}
        onSubmitPassword={submitPassword}
        passwordSubmitted={passwordSubmitted}
        isPasswordCorrect={passwordGuess === finalPassword}
      />
      
      {/* How It Works Section */}
      <HowItWorks />
    </div>
  );
};

export default LogicPuzzle;
