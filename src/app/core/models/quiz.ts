import { StudentQuizIntro } from '../../pages/Quizzes/student-quiz-intro/student-quiz-intro';
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

export interface UpdateQuizDto {
  title?: string;
  timeLimitMins?: number | null;
  passScore?: number;
  maxAttempts?: number;
  isRandomized?: boolean;
}
export interface QuizDto {
  id: number;
  courseId: number;
  courseTitle:string;
  title: string;
  timeLimitMins?: number | null;
  passScore: number;
  maxAttempts: number;
  isRandomized: boolean;
  isPublished:boolean;
  questionsCount:number
  totalPoints:number
}

export interface QuizSummaryDto
{
    id: number;
    courseId:number;
  title: string;
  timeLimitMins?: number | null;
  passScore: number;
  maxAttempts: number;
  questionCount:number
  totalPoints:number,
  attemptsLeft:number
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
  type: QuestionType;
  points: number;
  answerOptions: AnswerOptionDto[];
}

export interface CreateQuestionDto {
  text: string;
  type: string;
  points: number;
  answerOptions: CreateAnswerOptionDto[];
}

export interface UpdateQuestionDto {
  text: string;
  type: QuestionType;
  points: number;
   answerOptions: UpdateAnswerOptionDto[];
}

export interface QuizDetailsDto {
  id: number;
  courseId: number;
  courseTitle:string;
  title: string;
  timeLimitMins?: number | null;
  passScore: number;
  maxAttempts: number;
  isRandomized: boolean;
  isPublished:boolean;
  questions: QuestionDto[];
}
export interface CreateAnswerOptionDto {
  text: string;
  isCorrect: boolean;
}

export interface UpdateAnswerOptionDto {
  id: number|null;
  text: string;
  isCorrect: boolean;
}
export interface QuizAttemptHistoryDto {
  id: number;
  quizId: number;
  startedAt: string;
  score: number;
  passed: boolean;
}

export interface AttemptDto {
  id: number;
  quizId: number;
  startedAt: string;
}
export interface StudentQuizDto
{
   id:number;
   title:string;
   timeLimitMins:number|null;
   passScore:number;
   questions:StudentQuestionDto[];
}
export interface StudentQuestionDto
{
  id:number;
  text: string;
  type: QuestionType;
  points: number;
  answerOptions:StudentAnswerOptionDto[];


}
export interface StudentAnswerOptionDto
{
  id:number;
  text:string;
}

export interface QuestionReviewDto {
  questionId: number;
  questionText: string;
  selectedAnswerText: string;
  correctAnswerText: string;
  isCorrect: boolean;
  points: number;
}

export interface AttemptResultDto {
  attemptId: number;
  score: number;
  passed: boolean;
  submittedAt: string;
  totalPoints: number;
  earnedPoints: number;
  review: QuestionReviewDto[];
}
export interface AttemptHistoryDto {
  id: number;
  quizId: number;
  quizTitle: string;
  courseTitle: string;
  earnedPoints: number;
  totalPoints: number;
  score: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
}
export interface AvailableQuizDto {
  id: number;
  title: string;
  passScore: number;
  courseTitle: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
export interface GenerateQuizAiRequestDto {
  topic: string;
  questionCount: number;
  questionType: QuestionType
  pointsPerQuestion: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
export interface AiGeneratedOptionDto {
  text: string;
  isCorrect: boolean;
}
export interface AiGeneratedQuestionDto {
  text: string;
  type: QuestionType;
  points: number;
  options: AiGeneratedOptionDto[];
}
export interface AiGeneratedQuizDto {
  suggestedTitle: string;
  questions: AiGeneratedQuestionDto[];
}