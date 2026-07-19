
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useGameState } from '@/contexts/GameStateContext';
import { Question } from '../types/LogicPuzzleTypes';
import { questionSets, generatePassword } from '../utils/questionSets';

export const useLogicPuzzle = () => {
  const { updatePuzzleStatus } = useGameState();
  
  const [activeSetIndex, setActiveSetIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>(questionSets[0].questions);
  const [finalPassword, setFinalPassword] = useState<string>("");
  const [passwordGuess, setPasswordGuess] = useState<string>("");
  const [passwordSubmitted, setPasswordSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<number | null>(null);
  
  // Generate the final password based on correct answers from the active question set
  useEffect(() => {
    const password = generatePassword(questionSets[activeSetIndex]);
    setFinalPassword(password);
    // Reset password guess and submitted state when changing question sets
    setPasswordGuess("");
    setPasswordSubmitted(false);
  }, [activeSetIndex]);
  
  // Change the active question set
  const changeQuestionSet = (index: number) => {
    if (index >= 0 && index < questionSets.length) {
      setActiveSetIndex(index);
      setQuestions(questionSets[index].questions);
      setShowHint(null);
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId
          ? { ...q, selectedAnswer: answer }
          : q
      )
    );
  };
  
  // Submit an answer to a question
  const submitAnswer = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    
    if (!question || question.selectedAnswer === null) {
      toast.error("Please select an answer first");
      return;
    }
    
    const isCorrect = question.selectedAnswer === question.correctAnswer;
    
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId
          ? { ...q, answered: true }
          : q
      )
    );
    
    if (isCorrect) {
      toast.success("Correct answer!");
    } else {
      toast.error("Incorrect answer. Try again!");
    }
  };
  
  // Submit the final password
  const submitPassword = () => {
    if (passwordGuess.trim() === "") {
      toast.error("Please enter a password");
      return;
    }
    
    setPasswordSubmitted(true);
    
    if (passwordGuess === finalPassword) {
      toast.success("Correct password! Puzzle completed!");
      updatePuzzleStatus('room1', 'logic', true);
    } else {
      toast.error("Incorrect password. Try again!");
      setTimeout(() => setPasswordSubmitted(false), 2000);
    }
  };
  
  // Reset a question to try again
  const resetQuestion = (questionId: number) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId
          ? { ...q, answered: false, selectedAnswer: null }
          : q
      )
    );
  };
  
  // Toggle hint visibility
  const toggleHint = (questionId: number) => {
    setShowHint(showHint === questionId ? null : questionId);
  };
  
  // Check if all questions have been answered correctly
  const allQuestionsAnswered = questions.every(q => 
    q.answered && q.selectedAnswer === q.correctAnswer
  );

  return {
    questionSets,
    activeSetIndex,
    questions,
    finalPassword,
    passwordGuess,
    passwordSubmitted,
    showHint,
    allQuestionsAnswered,
    changeQuestionSet,
    handleAnswerSelect,
    submitAnswer,
    submitPassword,
    resetQuestion,
    toggleHint,
    setPasswordGuess
  };
};
