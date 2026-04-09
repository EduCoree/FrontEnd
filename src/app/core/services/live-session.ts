// src/app/core/services/live-session.ts
// ─── LiveSessionService ───────────────────────────────────────────────────────
// Branch: feature/live-session-models-services

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LiveSessionResponse,
  CreateLiveSessionRequest,
  UpdateLiveSessionRequest,
  UpdateRecordingRequest,
  JoinSessionResponse,
} from '../models/session';

@Injectable({ providedIn: 'root' })
export class LiveSessionService {

  private teacherBase = `${environment.apiUrl}/api/teacher/courses`;
  private studentBase = `${environment.apiUrl}/api/sessions`;

  constructor(private http: HttpClient) {}

  // ─── Teacher Endpoints ───────────────────────────────────────────────────

  /** GET /api/teacher/courses/{courseId}/sessions */
  getSessionsByCourse(courseId: number): Observable<LiveSessionResponse[]> {
    return this.http.get<LiveSessionResponse[]>(
      `${this.teacherBase}/${courseId}/sessions`
    );
  }

  /** POST /api/teacher/courses/{courseId}/sessions */
  scheduleSession(
    courseId: number,
    payload: CreateLiveSessionRequest
  ): Observable<LiveSessionResponse> {
    return this.http.post<LiveSessionResponse>(
      `${this.teacherBase}/${courseId}/sessions`,
      payload
    );
  }

  /** PUT /api/teacher/courses/{courseId}/sessions/{sessionId} */
  updateSession(
    courseId: number,
    sessionId: number,
    payload: UpdateLiveSessionRequest
  ): Observable<LiveSessionResponse> {
    return this.http.put<LiveSessionResponse>(
      `${this.teacherBase}/${courseId}/sessions/${sessionId}`,
      payload
    );
  }

  /** DELETE /api/teacher/courses/{courseId}/sessions/{sessionId} */
  cancelSession(courseId: number, sessionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.teacherBase}/${courseId}/sessions/${sessionId}`
    );
  }

  /** PUT /api/teacher/courses/{courseId}/sessions/{sessionId}/recording */
  addRecording(
    courseId: number,
    sessionId: number,
    payload: UpdateRecordingRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.teacherBase}/${courseId}/sessions/${sessionId}/recording`,
      payload
    );
  }

  // ─── Student Endpoints ───────────────────────────────────────────────────

  /** GET /api/sessions/upcoming */
  getUpcomingSessions(): Observable<LiveSessionResponse[]> {
    return this.http.get<LiveSessionResponse[]>(
      `${this.studentBase}/upcoming`
    );
  }

  /** GET /api/sessions/{sessionId}/join */
  joinSession(sessionId: number): Observable<JoinSessionResponse> {
    return this.http.get<JoinSessionResponse>(
      `${this.studentBase}/${sessionId}/join`
    );
  }
}
