import { AnswerOptionDto, AttemptDto, AttemptHistoryDto, CreateAnswerOptionDto, ApiResponse, QuizSummaryDto, StudentQuizDto, AttemptResultDto, QuizAttemptHistoryDto } from './../models/quiz';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateQuestionDto, CreateQuizDto, QuestionDto, QuizDetailsDto, QuizDto, UpdateQuestionDto } from '../models/quiz';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private baseUrl = `${environment.apiUrl}/api/teacher/courses`;

  constructor(private http: HttpClient) {}

  getQuizzes(courseId: number): Observable<QuizDto[]> {
    return this.http
      .get<ApiResponse<QuizDto[]>>(`${this.baseUrl}/${courseId}/quizzes`)
      .pipe(map(res =>{ 
        return res.data ?? res;
      }));
  }
 getQuizById(courseId:Number,quizId:number):Observable<ApiResponse<QuizDto>>
  {
     return this.http.get<ApiResponse<QuizDto>>(
    `${this.baseUrl}/${courseId}/quizzes/${quizId}`
  );
  }
 
  createQuiz(courseId: number, dto: CreateQuizDto): Observable<QuizDto> {
    return this.http.post<QuizDto>(`${this.baseUrl}/${courseId}/quizzes`, dto);
  }

  deleteQuiz(courseId: number, quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseId}/quizzes/${quizId}`);
  }





 


}