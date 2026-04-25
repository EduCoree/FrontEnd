import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { CashPaymentRequestDto } from '../models/enrollment.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminCashRequestService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/admin/cash-requests`;

  getAll(): Observable<ApiResponse<CashPaymentRequestDto[]>> {
    return this.http.get<ApiResponse<CashPaymentRequestDto[]>>(this.baseUrl);
  }

  confirm(id: number): Observable<ApiResponse<CashPaymentRequestDto>> {
    return this.http.put<ApiResponse<CashPaymentRequestDto>>(
      `${this.baseUrl}/${id}/confirm`, {}
    );
  }

  reject(id: number): Observable<ApiResponse<CashPaymentRequestDto>> {
    return this.http.put<ApiResponse<CashPaymentRequestDto>>(
      `${this.baseUrl}/${id}/reject`, {}
    );
  }
}