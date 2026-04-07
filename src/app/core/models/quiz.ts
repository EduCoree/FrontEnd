export enum QuestionType {
  MCQ = 'MCQ',
  TrueFalse = 'TrueFalse'
}

export interface CreateQuizDto {
     title: string;
    timeLimitMins?: number | null;
    passScore: number;
    maxAttempts: number;
     isRandomized: boolean;

}
export interface QuizDto {
  id: number;
  courseId: number;
  title: string;
  timeLimitMins?: number | null;
  passScore: number;
  maxAttempts: number;
  isRandomized: boolean;
}


// quiz.interfaces.ts

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AnswerOptionDto {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface QuestionDto {
  id: number;
  text: string;
  type: string;
  points: number;
  answerOptions: AnswerOptionDto[];
}

export interface CreateQuestionDto {
  text: string;
  type: string;
  points: number;
}

export interface UpdateQuestionDto {
  text?: string;
  type?: string;
  points?: number;
}

export interface QuizDetailsDto {
  id: number;
  courseId: number;
  title: string;
  timeLimitMins?: number | null;
  passScore: number;
  maxAttempts: number;
  isRandomized: boolean;
  questions: QuestionDto[];
}
export interface CreateAnswerOptionDto {
  text: string;
  isCorrect: boolean;
}

export interface UpdateAnswerOptionDto {
  text?: string;
  isCorrect?: boolean;
}