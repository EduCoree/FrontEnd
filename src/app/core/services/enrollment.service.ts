import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  EnrollmentDto, 
  CheckoutDto, 
  CheckoutResponseDto 
} from '../models/enrollment.models';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private baseUrl = `${environment.apiUrl}/api/enrollments`;

  constructor(private http: HttpClient) {}

// free enroll 
  enrollFree(courseId: number): Observable<ApiResponse<EnrollmentDto>> {
    return this.http.post<ApiResponse<EnrollmentDto>>(
      `${this.baseUrl}/free/${courseId}`, 
      {}
    );
  }

// checkout for paid courses
  createCheckout(dto: CheckoutDto): Observable<ApiResponse<CheckoutResponseDto>> {
    return this.http.post<ApiResponse<CheckoutResponseDto>>(
      `${this.baseUrl}/checkout`, 
      dto
    );
  }

// execute paid enrollment after payment success
  buyNow(courseId: number): Observable<ApiResponse<CheckoutResponseDto>> {
    return this.createCheckout({ courseId });
  }

  // request enrollment via cash payment (waiting for admin approval)
  enrollWithCash(courseId: number): Observable<ApiResponse<EnrollmentDto>> {
    return this.http.post<ApiResponse<EnrollmentDto>>(
      `${this.baseUrl}/cash/${courseId}`, 
      {}
    );
  }
}