// src/app/core/services/student-content.ts
// ─── StudentContentService ────────────────────────────────────────────────────
// Branch: feature/live-session-models-services

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SignedUrlResponse } from '../models/session';

@Injectable({ providedIn: 'root' })
export class StudentContentService {

  private videoBase = `${environment.apiUrl}/api/video`;

  constructor(private http: HttpClient) {}

  // ─── Video Signed URL ────────────────────────────────────────────────────

  /** GET /api/video/{lessonId}/signed-url
   *  Returns a time-limited (2-hour TTL) signed URL for secure video playback.
   *  Backend enforces: enrollment check, expiry date, free-preview bypass.
   */
  getVideoSignedUrl(lessonId: number): Observable<SignedUrlResponse> {
    return this.http.get<SignedUrlResponse>(
      `${this.videoBase}/${lessonId}/signed-url`
    );
  }
}
