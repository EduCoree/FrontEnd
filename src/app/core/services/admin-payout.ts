import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminPayoutDashboardDto,
  ApiResponse,
  CancelInvoiceDto,
  GenerateInvoicesResultDto,
  InvoiceStatus,
  MarkInvoiceAsPaidDto,
  PagedResult,
  PaginationParams,
  TeacherInvoiceDetailDto,
  TeacherInvoiceDto,
} from '../models/payout.model';

/**
 * Wraps the admin-facing payout endpoints.
 * Routes match: api/admin/payout/*  (defined in AdminPayoutController.cs)
 */
@Injectable({ providedIn: 'root' })
export class AdminPayoutService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin/payout`;

  // ── Dashboard ───────────────────────────────────────────────────────

  getDashboard(): Observable<AdminPayoutDashboardDto> {
    return this.http
      .get<ApiResponse<AdminPayoutDashboardDto>>(`${this.base}/dashboard`)
      .pipe(map(r => r.data));
  }

  // ── Invoice Listing ─────────────────────────────────────────────────

  getAllInvoices(
    pagination: PaginationParams,
    filters?: {
      status?: InvoiceStatus | null;
      teacherId?: string | null;
      from?: string | null;
      to?: string | null;
    },
  ): Observable<PagedResult<TeacherInvoiceDto>> {
    let params = new HttpParams()
      .set('pageNumber', pagination.pageNumber)
      .set('pageSize', pagination.pageSize);

    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);

    return this.http
      .get<ApiResponse<PagedResult<TeacherInvoiceDto>>>(`${this.base}/invoices`, { params })
      .pipe(map(r => r.data));
  }

  getInvoiceDetail(invoiceId: number): Observable<TeacherInvoiceDetailDto> {
    return this.http
      .get<ApiResponse<TeacherInvoiceDetailDto>>(`${this.base}/invoices/${invoiceId}`)
      .pipe(map(r => r.data));
  }

  // ── Invoice Actions ─────────────────────────────────────────────────

  markInvoiceAsPaid(
    invoiceId: number,
    dto: MarkInvoiceAsPaidDto,
  ): Observable<TeacherInvoiceDto> {
    return this.http
      .put<ApiResponse<TeacherInvoiceDto>>(`${this.base}/invoices/${invoiceId}/mark-paid`, dto)
      .pipe(map(r => r.data));
  }

  cancelInvoice(invoiceId: number, dto: CancelInvoiceDto): Observable<TeacherInvoiceDto> {
    return this.http
      .put<ApiResponse<TeacherInvoiceDto>>(`${this.base}/invoices/${invoiceId}/cancel`, dto)
      .pipe(map(r => r.data));
  }

  // ── Manual Job Trigger ──────────────────────────────────────────────

  /**
   * Manually generates invoices for a specific year/month.
   * Idempotent: teachers who already have an invoice for the period are skipped.
   */
  generateInvoices(year: number, month: number): Observable<GenerateInvoicesResultDto> {
    const params = new HttpParams()
      .set('year', year)
      .set('month', month);

    return this.http
      .post<ApiResponse<GenerateInvoicesResultDto>>(
        `${this.base}/invoices/generate`,
        null,
        { params },
      )
      .pipe(map(r => r.data));
  }

  // ── Excel Report Download ───────────────────────────────────────────

  /**
   * Downloads the multi-sheet financial report Excel file.
   * Both `from` and `to` are optional (defaults to last 30 days on backend).
   */
  downloadFinancialReport(from?: string | null, to?: string | null): Observable<Blob> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get(
      `${environment.apiUrl}/api/payout/export/report/financial.xlsx`,
      {
        params,
        responseType: 'blob',
      },
    );
  }

  // ── PDF Download (admin can download any invoice) ───────────────────

  downloadInvoicePdf(invoiceId: number): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/api/payout/export/invoices/${invoiceId}/pdf`,
      { responseType: 'blob' },
    );
  }
}