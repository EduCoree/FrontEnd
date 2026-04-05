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
