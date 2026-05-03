import { Injectable } from '@angular/core';
import { AiGeneratedQuizDto, ApiResponse, GenerateQuizAiRequestDto } from '../models/quiz';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuizAi {
  private baseUrl = `${environment.apiUrl}/api/teacher/quizzes`;

  constructor(private http: HttpClient) {}
  generateQuiz(quizId: number, dto: GenerateQuizAiRequestDto): Observable<ApiResponse<AiGeneratedQuizDto>> {
  return this.http.post<ApiResponse<AiGeneratedQuizDto>>(
    `${this.baseUrl}/${quizId}/ai-quiz/generate`, dto
  );
}

saveGeneratedQuiz(quizId: number, dto: AiGeneratedQuizDto): Observable<ApiResponse<AiGeneratedQuizDto>> {
  return this.http.post<ApiResponse<AiGeneratedQuizDto>>(
    `${this.baseUrl}/${quizId}/ai-quiz/save`, dto
  );

  
}
}
