
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  answered: boolean;
  selectedAnswer: string | null;
}

export interface QuestionSet {
  id: number;
  title: string;
  questions: Question[];
}
