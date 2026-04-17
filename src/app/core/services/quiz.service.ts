import { AnswerOptionDto, AttemptDto, AttemptHistoryDto, CreateAnswerOptionDto, ApiResponse, QuizSummaryDto, StudentQuizDto, AttemptResultDto, QuizAttemptHistoryDto } from './../models/quiz';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateQuestionDto, CreateQuizDto, QuestionDto, QuizDetailsDto, QuizDto, UpdateQuestionDto, UpdateQuizDto } from '../models/quiz';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private baseUrl = `${environment.apiUrl}/api/teacher`;

  constructor(private http: HttpClient) {}

  getQuizzes(courseId: number): Observable<QuizDto[]> {
    return this.http
      .get<ApiResponse<QuizDto[]>>(`${this.baseUrl}/courses/${courseId}/quizzes`)
      .pipe(map(res =>{ 
        return res.data ?? res;
      }));
  }
 getQuizById(quizId:number):Observable<ApiResponse<QuizDto>>
  {
     return this.http.get<ApiResponse<QuizDto>>(
    `${this.baseUrl}/quizzes/${quizId}`
  );
  }
 
createQuiz(courseId: number, dto: CreateQuizDto): Observable<QuizDto> {
    return this.http.post<QuizDto>(`${this.baseUrl}/courses/${courseId}/quizzes`, dto);
  }

  updateQuiz( quizId: number, dto: UpdateQuizDto): Observable<QuizDto> {
    return this.http.put<QuizDto>(`${this.baseUrl}/quizzes/${quizId}`, dto);
  }

  deleteQuiz( quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/quizzes/${quizId}`);
  }





 


}