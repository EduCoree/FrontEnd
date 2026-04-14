import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse, CreateQuestionDto, QuestionDto, QuizDetailsDto, UpdateQuestionDto } from '../models/quiz';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private baseUrl = `${environment.apiUrl}/api/teacher/quizzes`;

  constructor(private http: HttpClient) {}
  addQuestion(quizId: number, dto: CreateQuestionDto): Observable<ApiResponse<QuestionDto>> {
    return this.http.post<ApiResponse<QuestionDto>>(
      `${this.baseUrl}/${quizId}/questions`, dto
    );
  }
  deleteQuestion( quizId: number, questionId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${quizId}/questions/${questionId}`
    );
  }
  
    getQuizQuestions(quizId: number): Observable<ApiResponse<QuizDetailsDto>> {
    return this.http.get<ApiResponse<QuizDetailsDto>>(
      `${this.baseUrl}/${quizId}/questions`
    );
  }
  updateQuestion( quizId: number, questionId: number, dto: UpdateQuestionDto): Observable<ApiResponse<QuestionDto>> {
    return this.http.put<ApiResponse<QuestionDto>>(
      `${this.baseUrl}/${quizId}/questions/${questionId}`, dto
    );
  }
}
