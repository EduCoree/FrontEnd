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
  private apiUrl = environment.apiUrl+"/api";
  private baseUrl = environment.apiUrl + "/api/teacher/courses";

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
  getQuizSummary(quizId:Number):Observable<ApiResponse<QuizSummaryDto>>
  {
      return this.http.get<ApiResponse<QuizSummaryDto>>(
         `${this.apiUrl}/quizzes/${quizId}/summary`
      )
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


getStudentQuiz(quizId: number): Observable<ApiResponse<StudentQuizDto>> {
  return this.http.get<ApiResponse<StudentQuizDto>>(
    `${this.apiUrl}/quizzes/${quizId}`
  );
}

submitAttempt(quizId: number, attemptId: number, body: {
  answers: { questionId: number; answerOptionId: number }[]
}): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.apiUrl}/quizzes/${quizId}/attempts/${attemptId}/submit`,
    body
  );
}

getQuizHistory(quizId: number): Observable<ApiResponse<QuizAttemptHistoryDto[]>> {
  return this.http.get<ApiResponse<QuizAttemptHistoryDto[]>>(
    `${this.apiUrl}/quizzes/${quizId}/attempts`
  );
}
getHistory(): Observable<ApiResponse<AttemptHistoryDto[]>> {
  return this.http.get<ApiResponse<AttemptHistoryDto[]>>(
    `${this.apiUrl}/quizzes/history`
  );
}
 
  startAttempt(quizId: number): Observable<ApiResponse<AttemptDto>> {
    return this.http.post<ApiResponse<AttemptDto>>(`${this.apiUrl}/quizzes/${quizId}/start`, {});
  }
  getAttemptResult(quizId: number, attemptId: number): Observable<ApiResponse<AttemptResultDto>> {
  return this.http.get<ApiResponse<AttemptResultDto>>(
    `${this.apiUrl}/quizzes/${quizId}/attempts/${attemptId}/result`
  );
  
}

}