import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, AttemptDto, AttemptHistoryDto, AttemptResultDto, AvailableQuizDto, PagedResult, QuizAttemptHistoryDto, QuizSummaryDto, StudentQuizDto } from '../models/quiz';

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
getHistory(params: {
  page: number;
  pageSize: number;
  status?: string | null;
  courseTitle?: string | null;
  days?: number | null;
}): Observable<ApiResponse<PagedResult<AttemptHistoryDto>>> {

  let httpParams = new HttpParams()
    .set('pageNumber', params.page)
    .set('pageSize', params.pageSize);

  if (params.status)      httpParams = httpParams.set('status', params.status);
  if (params.courseTitle) httpParams = httpParams.set('courseTitle', params.courseTitle);
  if (params.days)        httpParams = httpParams.set('days', params.days);

  return this.http.get<ApiResponse<PagedResult<AttemptHistoryDto>>>(
    `${this.baseUrl}/history`, { params: httpParams }
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
getAvailableQuizzes(
  params: {
  page: number;
  pageSize: number;
  courseTitle?: string | null;
}
): Observable<ApiResponse<PagedResult<AvailableQuizDto>>> {
  
  let httpParams = new HttpParams()
      .set('pageNumber', params.page || 1)
      .set('pageSize', params.pageSize || 10);

    if (params.courseTitle && params.courseTitle !== 'All') {
      httpParams = httpParams.set('courseTitle', params.courseTitle);
    }
    return this.http.get<ApiResponse<PagedResult<AvailableQuizDto>>>(`${this.baseUrl}/available`, { params: httpParams });
}

getAvailableCourseTitles(): Observable<ApiResponse<string[]>> {
  return this.http.get<ApiResponse<string[]>>(
    `${this.baseUrl}/available/courses`
  );
}

getHistoryCourseTitles(): Observable<ApiResponse<string[]>> {
  return this.http.get<ApiResponse<string[]>>(
    `${this.baseUrl}/history/courses`
  );
}
}
