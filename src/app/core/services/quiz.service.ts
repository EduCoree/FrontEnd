import { AnswerOptionDto, AttemptDto, AttemptHistoryDto, CreateAnswerOptionDto, ApiResponse, QuizSummaryDto, StudentQuizDto, AttemptResultDto, QuizAttemptHistoryDto, PagedResult } from './../models/quiz';

import { HttpClient, HttpParams } from '@angular/common/http';
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

  getQuizzes(courseId: number, params: {page: number; pageSize: number;}): Observable<ApiResponse<PagedResult<QuizDto>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.page || 1)
      .set('pageSize', params.pageSize || 10);

    return this.http
      .get<ApiResponse<PagedResult<QuizDto>>>(`${this.baseUrl}/courses/${courseId}/quizzes`,{params:httpParams})
      };

 getQuizById(quizId:number):Observable<ApiResponse<QuizDto>>
  {
     return this.http.get<ApiResponse<QuizDto>>(
    `${this.baseUrl}/quizzes/${quizId}`
  );
  }
 
createQuiz(courseId: number, dto: CreateQuizDto): Observable<ApiResponse<QuizDto>> {
    return this.http.post<ApiResponse<QuizDto>>(`${this.baseUrl}/courses/${courseId}/quizzes`, dto);
  }

  updateQuiz( quizId: number, dto: UpdateQuizDto): Observable<QuizDto> {
    return this.http.put<QuizDto>(`${this.baseUrl}/quizzes/${quizId}`, dto);
  }

  deleteQuiz( quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/quizzes/${quizId}`);
  }
  publishQuiz(quizId: number): Observable<ApiResponse<QuizDto>> {
  return this.http.post<ApiResponse<QuizDto>>(`${this.baseUrl}/quizzes/${quizId}/publish`, {});
}





 


}