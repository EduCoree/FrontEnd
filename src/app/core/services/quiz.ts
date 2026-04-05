import { CreateQuizDto, QuizDto } from './../models/quiz';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Quiz {
  private baseUrl = "https://localhost:44363/api/teacher/courses";

  constructor(private http: HttpClient) {
    

  }
  createQuiz(courseId: number, dto: CreateQuizDto): Observable<QuizDto> {
     return this.http.post<QuizDto>(`${this.baseUrl}/${courseId}/quizzes`, dto);
  }
  
  
}
