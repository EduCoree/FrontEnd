import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CurrentMonthEarningsDto,
  InvoiceStatus,
  PagedResult,
  PaginationParams,
  PayoutSettingsDto,
  TeacherEarningDto,
  TeacherEarningsSummaryDto,
  TeacherInvoiceDetailDto,
  TeacherInvoiceDto,
} from '../models/payout.model';

/**
 * Wraps the teacher-facing payout endpoints.
 * Routes match: api/teacher/payout/*  (defined in TeacherPayoutController.cs)
 *
 * Note on API responses: the backend wraps every response in
 * ApiResponse<T>{ success, data, message }. Each method here unwraps
 * the .data so callers work with plain DTOs.
 */
@Injectable({ providedIn: 'root' })
export class TeacherPayoutService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/teacher/payout`;

  // ── Earnings ────────────────────────────────────────────────────────

  getMyEarnings(
    pagination: PaginationParams,
    from?: string | null,
    to?: string | null,
  ): Observable<PagedResult<TeacherEarningDto>> {
    let params = new HttpParams()
      .set('pageNumber', pagination.pageNumber)
      .set('pageSize', pagination.pageSize);

    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http
      .get<ApiResponse<PagedResult<TeacherEarningDto>>>(`${this.base}/earnings`, { params })
      .pipe(map(r => r.data));
  }

  getCurrentMonthPreview(): Observable<CurrentMonthEarningsDto> {
    return this.http
      .get<ApiResponse<CurrentMonthEarningsDto>>(`${this.base}/earnings/current-month`)
      .pipe(map(r => r.data));
  }

  getEarningsSummary(): Observable<TeacherEarningsSummaryDto> {
    return this.http
      .get<ApiResponse<TeacherEarningsSummaryDto>>(`${this.base}/earnings/summary`)
      .pipe(map(r => r.data));
  }

  // ── Invoices ────────────────────────────────────────────────────────

  getMyInvoices(
    pagination: PaginationParams,
    status?: InvoiceStatus | null,
  ): Observable<PagedResult<TeacherInvoiceDto>> {
    let params = new HttpParams()
      .set('pageNumber', pagination.pageNumber)
      .set('pageSize', pagination.pageSize);

    if (status) params = params.set('status', status);

    return this.http
      .get<ApiResponse<PagedResult<TeacherInvoiceDto>>>(`${this.base}/invoices`, { params })
      .pipe(map(r => r.data));
  }

  getInvoiceDetail(invoiceId: number): Observable<TeacherInvoiceDetailDto> {
    return this.http
      .get<ApiResponse<TeacherInvoiceDetailDto>>(`${this.base}/invoices/${invoiceId}`)
      .pipe(map(r => r.data));
  }

  // ── Settings (read-only for teachers) ───────────────────────────────

  getPayoutSettings(): Observable<PayoutSettingsDto> {
    return this.http
      .get<ApiResponse<PayoutSettingsDto>>(`${this.base}/settings`)
      .pipe(map(r => r.data));
  }

  // ── PDF Download ────────────────────────────────────────────────────

  /**
   * Downloads an invoice PDF as a Blob.
   * The component handles the actual file save (e.g., via FileSaver or
   * a simple anchor click).
   */
  downloadInvoicePdf(invoiceId: number): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/api/payout/export/invoices/${invoiceId}/pdf`,
      { responseType: 'blob' },
    );
  }
}