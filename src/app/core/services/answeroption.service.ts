import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AnswerOptionDto, ApiResponse, CreateAnswerOptionDto } from '../models/quiz';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnsweroptionService {
  private baseUrl = `${environment.apiUrl}/api/teacher/questions`;

  constructor(private http: HttpClient) {}

  addanswerOption(questionId: number, dto: CreateAnswerOptionDto): Observable<ApiResponse<AnswerOptionDto>> {
    return this.http.post<ApiResponse<AnswerOptionDto>>(
      `${this.baseUrl}/${questionId}/options`, dto
    );
  }
  
  updateAnswerOption(questionId: number, optionId: number, dto: CreateAnswerOptionDto): Observable<ApiResponse<AnswerOptionDto>> {
    return this.http.put<ApiResponse<AnswerOptionDto>>(
      `${this.baseUrl}/${questionId}/options/${optionId}`, dto
    );
  
  }
  deleteAnswerOption(questionId: number, optionId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${questionId}/options/${optionId}`
    );
  }
  
}
