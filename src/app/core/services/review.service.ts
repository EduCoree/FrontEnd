import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewSummary, CreateReviewDto, UpdateReviewDto } from '../models/review.model';
import { environment } from '../../../environments/environment';

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
}