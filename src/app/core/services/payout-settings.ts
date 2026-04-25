import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PayoutSettingsDto, UpdatePayoutSettingsDto } from '../models/payout.model';

/**
 * Service for reading and updating the global payout configuration.
 * - Read endpoint is exposed under both /api/teacher/payout/settings and
 *   /api/admin/payout/settings. We use the admin one since it's the source of truth.
 * - Update is admin-only.
 *
 * Note: This service is independent of TeacherPayoutService and AdminPayoutService
 *       so the settings page can be loaded without pulling other deps.
 */
@Injectable({ providedIn: 'root' })
export class PayoutSettingsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin/payout`;

  getSettings(): Observable<PayoutSettingsDto> {
    return this.http
      .get<ApiResponse<PayoutSettingsDto>>(`${this.base}/settings`)
      .pipe(map(r => r.data));
  }

  updateSettings(dto: UpdatePayoutSettingsDto): Observable<PayoutSettingsDto> {
    return this.http
      .put<ApiResponse<PayoutSettingsDto>>(`${this.base}/settings`, dto)
      .pipe(map(r => r.data));
  }
}