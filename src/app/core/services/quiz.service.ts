import { AnswerOptionDto, CreateAnswerOptionDto } from './../models/quiz';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, CreateQuestionDto, CreateQuizDto, QuestionDto, QuizDetailsDto, QuizDto, UpdateQuestionDto } from '../models/quiz';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private baseUrl = environment.apiUrl + "/api/teacher/courses";

  constructor(private http: HttpClient) {}

  getQuizzes(courseId: number): Observable<QuizDto[]> {
    return this.http
      .get<ApiResponse<QuizDto[]>>(`${this.baseUrl}/${courseId}/quizzes`)
      .pipe(map(res =>{ 
        return res.data ?? res;
      }));
  }

  createQuiz(courseId: number, dto: CreateQuizDto): Observable<QuizDto> {
    return this.http.post<QuizDto>(`${this.baseUrl}/${courseId}/quizzes`, dto);
  }

  deleteQuiz(courseId: number, quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseId}/quizzes/${quizId}`);
  }
  getQuizQuestions(courseId: number, quizId: number): Observable<ApiResponse<QuizDetailsDto>> {
  return this.http.get<ApiResponse<QuizDetailsDto>>(
    `${this.baseUrl}/${courseId}/quizzes/${quizId}/questions`
  );
}

addQuestion(courseId: number, quizId: number, dto: CreateQuestionDto): Observable<ApiResponse<QuestionDto>> {
  return this.http.post<ApiResponse<QuestionDto>>(
    `${this.baseUrl}/${courseId}/quizzes/${quizId}/questions`, dto
  );
}

updateQuestion(courseId: number, quizId: number, questionId: number, dto: UpdateQuestionDto): Observable<ApiResponse<QuestionDto>> {
  return this.http.put<ApiResponse<QuestionDto>>(
    `${this.baseUrl}/${courseId}/quizzes/${quizId}/questions/${questionId}`, dto
  );
}

deleteQuestion(courseId: number, quizId: number, questionId: number): Observable<ApiResponse<void>> {
  return this.http.delete<ApiResponse<void>>(
    `${this.baseUrl}/${courseId}/quizzes/${quizId}/questions/${questionId}`
  );
}
addanswerOption(courseId: number, quizId: number, questionId: number, dto: CreateAnswerOptionDto): Observable<ApiResponse<AnswerOptionDto>> {
  return this.http.post<ApiResponse<AnswerOptionDto>>(
    `${this.baseUrl}/${courseId}/quizzes/${quizId}/questions/${questionId}/options`, dto
  );
}

updateAnswerOption(courseId: number, quizId: number, questionId: number, optionId: number, dto: CreateAnswerOptionDto): Observable<ApiResponse<AnswerOptionDto>> {
  return this.http.put<ApiResponse<AnswerOptionDto>>(
    `${this.baseUrl}/${courseId}/quizzes/${quizId}/questions/${questionId}/options/${optionId}`, dto
  );

}
deleteAnswerOption(courseId: number, quizId: number, questionId: number, optionId: number): Observable<ApiResponse<void>> {
  return this.http.delete<ApiResponse<void>>(
    `${this.baseUrl}/${courseId}/quizzes/${quizId}/questions/${questionId}/options/${optionId}`
  );
}
}