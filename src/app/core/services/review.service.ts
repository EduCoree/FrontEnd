import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewSummary, CreateReviewDto, UpdateReviewDto } from '../models/review.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/payout.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(courseId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/api/courses/${courseId}/reviews`);
  }

  getSummary(courseId: number): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.apiUrl}/api/courses/${courseId}/reviews/summary`);
  }

  create(courseId: number, dto: CreateReviewDto): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/api/courses/${courseId}/reviews`, dto);
  }

  update(courseId: number, reviewId: number, dto: UpdateReviewDto): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/api/courses/${courseId}/reviews/${reviewId}`, dto);
  }

  delete(courseId: number, reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/courses/${courseId}/reviews/${reviewId}`);
  }
  getMyReviews(): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/api/student/my-reviews`);
  }
// teacher 
  getTeacherReviews(courseId?: number, minRating?: number): Observable<ApiResponse<Review[]>> {
    let url = `${this.apiUrl}/api/teacher/reviews`;
    const params: string[] = [];
    
    if (courseId) params.push(`courseId=${courseId}`);
    if (minRating) params.push(`minRating=${minRating}`);
    
    if (params.length > 0) url += `?${params.join('&')}`;
    
    return this.http.get<ApiResponse<Review[]>>(url);
  }
  deleteAsTeacher(reviewId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/api/teacher/reviews/${reviewId}`);
  }
}