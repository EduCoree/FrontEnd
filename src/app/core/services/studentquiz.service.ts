import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, AttemptDto, AttemptHistoryDto, AttemptResultDto, QuizAttemptHistoryDto, QuizSummaryDto, StudentQuizDto } from '../models/quiz';

@Injectable({
  providedIn: 'root',
})
export class StudentquizService {
  
private baseUrl = `${environment.apiUrl}/api/quizzes`;
constructor(private http: HttpClient) {}
  
getStudentQuiz(quizId: number): Observable<ApiResponse<StudentQuizDto>> {
  return this.http.get<ApiResponse<StudentQuizDto>>(
    `${this.baseUrl}/${quizId}`
  );
}
 getQuizSummary(quizId:Number):Observable<ApiResponse<QuizSummaryDto>>
  {
      return this.http.get<ApiResponse<QuizSummaryDto>>(
         `${this.baseUrl}/${quizId}/summary`
      )
  }
submitAttempt(quizId: number, attemptId: number, body: {
  answers: { questionId: number; answerOptionId: number }[]
}): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.baseUrl}/${quizId}/attempts/${attemptId}/submit`,
    body
  );
}

getQuizHistory(quizId: number): Observable<ApiResponse<QuizAttemptHistoryDto[]>> {
  return this.http.get<ApiResponse<QuizAttemptHistoryDto[]>>(
    `${this.baseUrl}/${quizId}/attempts`
  );
}
getHistory(): Observable<ApiResponse<AttemptHistoryDto[]>> {
  return this.http.get<ApiResponse<AttemptHistoryDto[]>>(
    `${this.baseUrl}/history`
  );
}
 
  startAttempt(quizId: number): Observable<ApiResponse<AttemptDto>> {
    return this.http.post<ApiResponse<AttemptDto>>(`${this.baseUrl}/${quizId}/start`, {});
  }
  getAttemptResult(quizId: number, attemptId: number): Observable<ApiResponse<AttemptResultDto>> {
  return this.http.get<ApiResponse<AttemptResultDto>>(
    `${this.baseUrl}/${quizId}/attempts/${attemptId}/result`
  );
  
}
}
