import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { 
  PaymentDto, 
  CashPaymentDto,
  PaginationParams,
  PagedResult, 
  EnrollmentDto
} from '../models/enrollment.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/api/payments`;
  private adminBaseUrl = `${environment.apiUrl}/api/admin/payments`;

  constructor(private http: HttpClient) {}

// get my payment for student 
  getMyPaymentHistory(): Observable<ApiResponse<PaymentDto[]>> {
    return this.http.get<ApiResponse<PaymentDto[]>>(`${this.baseUrl}/my-history`);
  }
// admin record cash 
  recordCashPayment(dto: CashPaymentDto): Observable<ApiResponse<EnrollmentDto>> {
    return this.http.post<ApiResponse<EnrollmentDto>>(
      `${this.adminBaseUrl}/cash`, 
      dto
    );
  }

// admin get all payments with pagination 
  getAllPayments(pagination: PaginationParams): Observable<ApiResponse<PagedResult<PaymentDto>>> {
    const params = new HttpParams()
      .set('pageNumber', pagination.pageNumber.toString())
      .set('pageSize', pagination.pageSize.toString());

    return this.http.get<ApiResponse<PagedResult<PaymentDto>>>(
      this.adminBaseUrl, 
      { params }
    );
  }
}