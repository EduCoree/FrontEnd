// src/app/core/services/certificate.ts
// ─── CertificateService ───────────────────────────────────────────────────────
// Branch: feature/progress-models-services

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Certificate } from '../models/progress';

@Injectable({ providedIn: 'root' })
export class CertificateService {

  private base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // ─── Student: Own Certificates ────────────────────────────────────────────

  /**
   * GET /api/certificates/my
   * Returns all certificates earned by the authenticated student.
   * Consumed by MyCertificatesComponent.
   */
  getMyCertificates(): Observable<Certificate[]> {
    return this.http
      .get<any>(`${this.base}/certificates/my`)
      .pipe(map((res) => res.data ?? res));
  }

  // ─── Public: Single Certificate ───────────────────────────────────────────

  /**
   * GET /api/certificates/{certificateId}
   * Returns a single certificate by its numeric ID.
   * This endpoint is PUBLIC — no auth required.
   * Consumed by CertificateDetailComponent (no canActivate guard on that route).
   */
  getCertificate(certificateId: number): Observable<Certificate> {
    return this.http
      .get<any>(`${this.base}/certificates/${certificateId}`)
      .pipe(map((res) => res.data ?? res));
  }
}
